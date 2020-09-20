from network import NETWORK
from keyboard import BoardControl
import cv2
import time

network = NETWORK()
# network.start('192.168.1.14',12345)
network.start_tcp(12345)
network.accept_tcp()

keyboard = BoardControl()
keyboard.start()

last_state = 'stop'

def check_send():
    # print("check_send")
    global network,keyboard,last_state
    if(keyboard.dic['w'] == True or keyboard.dic['s'] == True or keyboard.dic['a'] == True or keyboard.dic['d'] == True):
        # print(keyboard.key_to_order[keyboard.dic['last']])
        if(keyboard.key_to_order[keyboard.dic['last']] != last_state):
            last_state = keyboard.key_to_order[keyboard.dic['last']]
            data = {'type':'move','order':keyboard.key_to_order[keyboard.dic['last']]}
            network.send_tcp(data)
    else:
        # print("stop")
        if('stop' != last_state):
            last_state = 'stop'
            data = {'type':'move','order':'stop'}
            network.send_tcp(data)

def end():
    global network
    data = {'type':'control','order':'END'}
    network.send_tcp(data)

def accpet():
    global network
    network.accept_tcp()

# cap = cv2.VideoCapture('http://192.168.2.5:8081/?type=some.mjpeg')

print("Start Control!")
while True:
    # ret, frame = cap.read()
    # cv2.imshow('The Car',frame)
    # print("go check send")
    if keyboard.closed == True:
        break
    try:
        if keyboard.end == True:
            end()
        else:
            check_send()
    except Exception as e:
        print(e)
        accpet()
        continue

    # if cv2.waitKey(1) & 0xFF == ord('q'):
    #     end()
    #     break
    # time.sleep(0.1)
# network.close()
network.close_tcp()
# cap.release()
# cv2.destroyAllWindows()
