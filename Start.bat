set url="http://localhost:5173/"
start "" "C:\Program Files\Google\Chrome\Application\chrome.exe" %url%
cd "C:\projects\osuverse"
code . | exit
npm run dev
