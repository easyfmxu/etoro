cd scripts/ 
node fetchPhoto.js 

cd root/
find ./data/photo -type f | wc -l 
ls ./data/photo | sed -E 's/^([a-z]{2})-.*/\1/' | sort | uniq | wc -l
ls ./data/photo | sed -E 's/^([a-z]{2})-.*/\1/' | sort | uniq
