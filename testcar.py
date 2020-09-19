from car import CAR

newcar = CAR()
if newcar.initialize():
    newcar.startlisten()
else:
    newcar.poweroff()
