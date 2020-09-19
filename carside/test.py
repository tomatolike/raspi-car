from control import CONTROL

controller = CONTROL()

while True:
    order = raw_input("Input order:\n")
    if(order == "G" or order == "g"):
        controller.forward()
    if(order == "B" or order == "b"):
        controller.back()
    if(order == "L" or order == "l"):
        controller.left()
    if(order == "R" or order == "r"):
        controller.right()
    if(order == "S" or order == "s"):
        controller.stop()
    if(order == "E" or order == "e"):
        controller.end()
        break
    if(order == "lo" or order == "LO"):
        controller.left_forward()
    if(order == "lbo" or order == "LBO"):
        controller.left_back()
    if(order == "ro" or order == "RO"):
        controller.right_forward()
    if(order == "rbo" or order == "RBO"):
        controller.right_back()
