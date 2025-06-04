import webview
import os
import sys
import subprocess
import time
import logging
from packaging import version

# Set up logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

def get_next_server_url():
    return "http://localhost:3000"  # Default Next.js dev server URL

def start_next_server():
    project_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    logger.info(f"Starting Next.js server from directory: {project_dir}")
    
    # First build the Next.js application
    try:
        logger.info("Building Next.js application...")
        subprocess.run(
            "npm run build",
            shell=True,
            cwd=project_dir,
            check=True
        )
    except subprocess.CalledProcessError as e:
        logger.error(f"Failed to build Next.js application: {e}")
        sys.exit(1)

    # Start the production server
    try:
        logger.info("Starting Next.js production server...")
        process = subprocess.Popen(
            "npm run start",
            shell=True,
            cwd=project_dir,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE
        )
        
        # Wait for the server to start
        time.sleep(5)  # Give the server some time to start
        return process
    except Exception as e:
        logger.error(f"Failed to start Next.js server: {e}")
        sys.exit(1)

def main():
    try:
        # Start Next.js server
        logger.info("Initializing application...")
        server_process = start_next_server()
        
        # Create a window with debug mode enabled
        logger.info("Creating window...")
        window = webview.create_window(
            "Mermaid Designer",
            get_next_server_url(),
            width=1200,
            height=800,
            min_size=(800, 600)
        )
        
        # Start the webview application
        logger.info("Starting webview...")
        webview.start(debug=True)
        
    except Exception as e:
        logger.error(f"Application error: {e}")
        raise
    finally:
        # Cleanup
        logger.info("Shutting down server...")
        if 'server_process' in locals():
            server_process.terminate()

if __name__ == "__main__":
    main()
