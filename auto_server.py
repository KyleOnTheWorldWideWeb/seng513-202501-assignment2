import subprocess
import time
import sys
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
import os

class ServerHandler(FileSystemEventHandler):
    def __init__(self):
        self.server_process = None
        self.start_server()

    def start_server(self):
        if self.server_process:
            self.server_process.terminate()
            self.server_process.wait()
        
        print("\nStarting server...")
        self.server_process = subprocess.Popen([sys.executable, "-m", "http.server", "8000"])

    def on_modified(self, event):
        if event.src_path.endswith(('.py', '.js', '.css', '.html')):
            print(f"\nChange detected in {event.src_path}")
            self.start_server()

def main():
    path = '.'
    event_handler = ServerHandler()
    observer = Observer()
    observer.schedule(event_handler, path, recursive=True)
    observer.start()
    print(f"Watching for changes in {os.path.abspath(path)}")
    print("Press Ctrl+C to stop")
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        observer.stop()
        if event_handler.server_process:
            event_handler.server_process.terminate()
    observer.join()

if __name__ == "__main__":
    main() 