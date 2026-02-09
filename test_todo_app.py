#!/usr/bin/env python3
"""
Simple test script for the Todo App
"""

import subprocess
import sys
import time

def test_todo_app():
    print("Testing the Todo App functionality...")

    # Test adding a todo
    print("\n1. Testing add command:")
    result = subprocess.run([sys.executable, 'src/main.py', 'add', 'Test task 1'],
                          capture_output=True, text=True)
    print("Output:", result.stdout)

    # Test listing todos
    print("\n2. Testing list command:")
    result = subprocess.run([sys.executable, 'src/main.py', 'list'],
                          capture_output=True, text=True)
    print("Output:", result.stdout)

    # Test completing a todo
    print("\n3. Testing complete command:")
    result = subprocess.run([sys.executable, 'src/main.py', 'complete', '1'],
                          capture_output=True, text=True)
    print("Output:", result.stdout)

    # Test listing again to see completion status
    print("\n4. Testing list command after completion:")
    result = subprocess.run([sys.executable, 'src/main.py', 'list'],
                          capture_output=True, text=True)
    print("Output:", result.stdout)

    # Test adding another todo
    print("\n5. Testing adding another todo:")
    result = subprocess.run([sys.executable, 'src/main.py', 'add', 'Test task 2'],
                          capture_output=True, text=True)
    print("Output:", result.stdout)

    # Final list
    print("\n6. Final list:")
    result = subprocess.run([sys.executable, 'src/main.py', 'list'],
                          capture_output=True, text=True)
    print("Output:", result.stdout)

if __name__ == "__main__":
    test_todo_app()