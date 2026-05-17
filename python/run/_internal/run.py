#!/usr/bin/env python3
import os
import sys
from pathlib import Path

os.environ['RICH_WINDOWS_CONSOLE'] = 'off'
os.environ['FORCE_COLOR'] = '1'
os.environ['PYTHONIOENCODING'] = 'utf-8'
project_root = Path(__file__).parent
sys.path.insert(0, str(project_root))
os.chdir(project_root)

if __name__ == "__main__":
    from cli.main import main

    main()
