from control import CONTROL
from network import NETWORK
from fancontrol import FanControl
import subprocess
import time

class CAR:

    def initialize(self):
        try:
            print("Initial Controller")
            self.controller = CONTROL()
        except:
            print("Controller INIT Failed")
            return False

        try:
            print("Initial Network")
            self.network = NETWORK()
            #self.network.start(12345)
            self.connect_to()
        except Exception as e:
            print("Network INIT Failed",e)
            return False

        # try:
        #     self.fan = FanControl()
        #     self.fan.initialize()
        #     self.fan.start()
        # except Exception,e:
        #     print("Fan INIT Failed",e)
        #     return False

        # try:
        #     print("Initial Motion")
        #     self.motion = subprocess.Popen('sudo motion', shell=True)
        # except:
        #     print("Motion INIT Failed")
        #     return False

        self.status = "stop"
        return True

    def poweroff(self):
        print("Power Off")
        try:
            self.network.close_tcp()
        except:
            print("END Network Failed")
        try:
            self.controller.end()
        except:
            print("END Controller Failed")
        #try:
        #    self.fan.stop()
        #except:
        #    print("END Fan Failed")
        # try:
        #     self.motion.kill()
        # except:
        #     print("END motion Failed")

    def connect_to(self):
        while not self.network.connect_tcp('192.168.1.13',12345):
            print("Connecting ...")
            time.sleep(5)

    def startlisten(self):
        while True:
            try:
                data = self.network.listen_tcp()
            except:
                self.connect_to()
                continue
            # print(data)
            if(data["type"] == "move"):
                self.move(data)
            if(data["type"] == "control"):
                if data["order"] == "END":
                    break
        self.poweroff()

    def move(self, data):
        order = data["order"]
        if(order != self.status):
            self.status = order
            if(order == "forward"):
                print("forward")
                self.controller.forward()
            if(order == "back"):
                print("back")
                self.controller.back()
            if(order == "left"):
                print("left")
                self.controller.left()
            if(order == "right"):
                print("right")
                self.controller.right()
            if(order == "stop"):
                print("stop")
                self.controller.stop()
