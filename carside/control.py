import RPi.GPIO as GPIO
import time

class CONTROL:

    def __init__(self):
        self.IN1 = 18
        self.IN2 = 16
        self.IN3 = 13
        self.IN4 = 15

        GPIO.setmode(GPIO.BOARD)

        GPIO.setup(self.IN1, GPIO.OUT)
        GPIO.setup(self.IN2, GPIO.OUT)
        GPIO.setup(self.IN3, GPIO.OUT)
        GPIO.setup(self.IN4, GPIO.OUT)

    def left_forward(self):
        GPIO.output(self.IN1, GPIO.HIGH)
        GPIO.output(self.IN2, GPIO.LOW)

    def left_back(self):
        GPIO.output(self.IN1, GPIO.LOW)
        GPIO.output(self.IN2, GPIO.HIGH)

    def left_stop(self):
        GPIO.output(self.IN1, GPIO.LOW)
        GPIO.output(self.IN2, GPIO.LOW)

    def right_forward(self):
        GPIO.output(self.IN4, GPIO.HIGH)
        GPIO.output(self.IN3, GPIO.LOW)

    def right_back(self):
        GPIO.output(self.IN4, GPIO.LOW)
        GPIO.output(self.IN3, GPIO.HIGH)

    def right_stop(self):
        GPIO.output(self.IN4, GPIO.LOW)
        GPIO.output(self.IN3, GPIO.LOW)

    def forward(self):
        self.left_forward()
        self.right_forward()

    def back(self):
        self.left_back()
        self.right_back()

    def left(self):
        self.left_stop()
        self.right_forward()

    def right(self):
        self.left_forward()
        self.right_stop()

    def stop(self):
        self.left_stop()
        self.right_stop()

    def end(self):
        GPIO.cleanup()

