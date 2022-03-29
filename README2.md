step to set :
to set responsive gif
replace Banner.gif from folder /public/config/Banner.gif
to set png background
replace bg.png from folder /public/config/bg.png

to set url to opensea collection 
replace "#" with collection url on  /src/App.js

to replace images/gif on the left 
in App.js file at line 231
for res under 1000px (width) 
replace the route of the image object  after the ? and before the :
for res over 1000px (width)
replace the route of the image object  after the : and before the }

image={mediaMatch.matches ? "/config/images/banner.gif" : "/config/images/banner.gif"}  

to generate deploy files (build)
in terminal inside of the folder of your proyect execute 
npm run build
this gonna update the build folder commpress all the content of build folder to deploy on subdomain
