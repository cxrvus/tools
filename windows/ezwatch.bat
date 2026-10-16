@echo off

:loop
cls & call %* & timeout /t 1 /nobreak >nul & goto loop