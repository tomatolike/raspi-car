# car controller client

from pynput import keyboard
import threading

class BoardControl(threading.Thread):

	def __init__(self):
		super().__init__()
		self.dic = {
			'w':False,
			's':False,
			'a':False,
			'd':False,
			'last':''
		}

		self.key_to_order = {
			'w':'forward',
			's':'back',
			'a':'left',
			'd':'right'
		}

		self.end = False
		self.closed = False

	def on_press(self,key):
		if key == keyboard.Key.esc:
			self.end = True
			return False
		try:
			k = key.char
		except:
			k = key.name

		if k == 'q':
			self.end = True
		
		if k == 'c':
			self.closed = True
			return False

		if k in self.dic:
			self.dic[k] = True
			self.dic['last'] = k

	def on_release(self,key):
		try:
			k = key.char
		except:
			k = key.name

		if k == 'q':
			self.end = False

		if k in self.dic:
			self.dic[k] = False

	def run(self):
		self.listener = keyboard.Listener(on_press=self.on_press,on_release=self.on_release)
		self.listener.start()
		self.listener.join()