set url="http://localhost:5173/"
start chrome %url%
cd "C:\projects\osuverse"
code . | exit
npm run dev
