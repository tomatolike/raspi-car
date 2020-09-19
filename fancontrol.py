import Adafruit_GPIO.I2C as I2C

import time
import os
import smbus

import Adafruit_SSD1306

from PIL import Image
from PIL import ImageDraw
from PIL import ImageFont

import subprocess
import threading

class FanControl(threading.Thread):

    def __init__(self):
        super(FanControl,self).__init__()

    def initialize(self):
        self.bus = smbus.SMBus(1)
        self.hat_addr = 0x0d
        self.rgb_effect_reg = 0x04
        self.fan_reg = 0x08
        self.fan_state = 2
        self.count = 0
        self.ok = True

        # Raspberry Pi pin configuration:
        self.RST = None     # on the PiOLED this pin isnt used

        # 128x32 display with hardware I2C:
        self.disp = Adafruit_SSD1306.SSD1306_128_32(rst=self.RST)

        # Initialize library.
        self.disp.begin()

        # Clear display.
        self.disp.clear()
        self.disp.display()

        # Create blank image for drawing.
        # Make sure to create image with mode '1' for 1-bit color.
        self.width = self.disp.width
        self.height = self.disp.height
        self.image = Image.new('1', (self.width, self.height))

        # Get drawing object to draw on image.
        self.draw = ImageDraw.Draw(self.image)

        # Draw a black filled box to clear the image.
        self.draw.rectangle((0,0,self.width,self.height), outline=0, fill=0)

        # Draw some shapes.
        # First define some constants to allow easy resizing of shapes.
        self.padding = -2
        self.top = self.padding
        self.bottom = self.height-self.padding
        # Move left to right keeping track of the current x position for drawing shapes.
        self.x = 0

        # Load default font.
        self.font = ImageFont.load_default()

        # Alternatively load a TTF font.  Make sure the .ttf font file is in the same directory as the python script!
        # Some other nice fonts to try: http://www.dafont.com/bitmap.php
        # font = ImageFont.truetype('Minecraftia.ttf', 8)

    def setFanSpeed(self,speed):
        self.bus.write_byte_data(self.hat_addr, self.fan_reg, speed&0xff)

    def setRGBEffect(self,effect):
        self.bus.write_byte_data(self.hat_addr, self.rgb_effect_reg, effect&0xff)

    def getCPULoadRate(self):
        f1 = os.popen("cat /proc/stat", 'r')
        stat1 = f1.readline()
        
        count = 10
        data_1 = []
        for i  in range (count):
            data_1.append(int(stat1.split(' ')[i+2]))
        total_1 = data_1[0]+data_1[1]+data_1[2]+data_1[3]+data_1[4]+data_1[5]+data_1[6]+data_1[7]+data_1[8]+data_1[9]
        idle_1 = data_1[3]

        time.sleep(1)

        f2 = os.popen("cat /proc/stat", 'r')
        stat2 = f2.readline()
        data_2 = []
        for i  in range (count):
            data_2.append(int(stat2.split(' ')[i+2]))
        total_2 = data_2[0]+data_2[1]+data_2[2]+data_2[3]+data_2[4]+data_2[5]+data_2[6]+data_2[7]+data_2[8]+data_2[9]
        idle_2 = data_2[3]

        total = int(total_2-total_1)
        idle = int(idle_2-idle_1)
        usage = int(total-idle)
        # print("idle:"+str(idle)+"  total:"+str(total))
        usageRate =int(float(usage * 100/ total))
        # print("usageRate:%d"%usageRate)
        return "CPU:"+str(usageRate)+"%"


    def setOLEDshow(self):
        # Draw a black filled box to clear the image.
        self.draw.rectangle((0,0,self.width,self.height), outline=0, fill=0)

        #cmd = "top -bn1 | grep load | awk '{printf \"CPU:%.0f%%\", $(NF-2)*100}'"
        #CPU = subprocess.check_output(cmd, shell = True)
        CPU = self.getCPULoadRate()

        cmd = os.popen('vcgencmd measure_temp').readline()
        CPU_TEMP = cmd.replace("temp=","Temp:").replace("'C\n","C")

        self.g_temp = float(cmd.replace("temp=","").replace("'C\n",""))

        cmd = "free -m | awk 'NR==2{printf \"RAM:%s/%s MB \", $2-$3,$2}'"
        MemUsage = subprocess.check_output(cmd, shell = True)

        cmd = "df -h | awk '$NF==\"/\"{printf \"Disk:%d/%dMB\", ($2-$3)*1024,$2*1024}'"
        Disk = subprocess.check_output(cmd, shell = True)

        cmd = "hostname -I | cut -d\' \' -f1"
        IP = subprocess.check_output(cmd, shell = True)

        # Write two lines of text.

        self.draw.text((self.x, self.top), str(CPU), font=self.font, fill=255)
        self.draw.text((self.x+56, self.top), str(CPU_TEMP), font=self.font, fill=255)
        self.draw.text((self.x, self.top+8), str(MemUsage),  font=self.font, fill=255)
        self.draw.text((self.x, self.top+16), str(Disk),  font=self.font, fill=255)
        self.draw.text((self.x, self.top+24), str(IP),  font=self.font, fill=255)

        # Display image.
        self.disp.image(self.image)
        self.disp.display()

    def run(self):
        self.setFanSpeed(0x00)
        self.setRGBEffect(0x03)

        while self.ok:
            self.setOLEDshow()	
            if self.g_temp >= 55:
                if self.fan_state != 1:
                    self.setFanSpeed(0x01)
                    self.fan_state = 1        
            elif self.g_temp <= 48:
                if self.fan_state != 0:
                    self.setFanSpeed(0x00)
                    self.fan_state = 0
            
            if self.count == 10:
                self.setRGBEffect(0x04)
            elif self.count == 20:
                self.setRGBEffect(0x02)
            elif self.count == 30:
                self.setRGBEffect(0x01)
            elif self.count == 40:
                self.setRGBEffect(0x03)
                self.count = 0
            self.count += 1
            time.sleep(1)
        
        self.disp.clear()
        self.disp.display()
        # self.disp.end()
        self.setFanSpeed(0x00)
        self.setRGBEffect(0x03)

    def stop(self):
        self.ok = False
