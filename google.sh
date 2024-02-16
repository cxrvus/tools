query="$*"
# Check if there is a running Chrome incognito window
chrome_window=$(wmctrl -lx | grep "Google-chrome" | grep "incognito" | tail -n 1 | awk '{print $1}')
if [ -n "$chrome_window" ]; then
    # If there is an existing incognito window, use it to open a new tab
    wmctrl -ia "$chrome_window"
    sleep 0.5  # Wait for window focus to switch
    xdotool key --clearmodifiers ctrl+t
else
    # If there is no existing incognito window, open a new one
    google-chrome --incognito &
    sleep 1  # Wait for Chrome to open
    xdotool key --clearmodifiers ctrl+t
fi
# Wait for the new tab to load before typing the query
sleep 1
xdotool type --delay 50 "$query"
xdotool key --delay 50 "Return"
