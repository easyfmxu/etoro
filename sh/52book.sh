#bash sh/52book.sh hwPA 103
book=$1
pages=$2

node js/52book.js book=$book c=$pages #original/
node js/combine.js fr=$book  #All.txt
#node js/rename.js
node js/split.js fr=$book #ch/ by 第
node js/clean.js fr=$book #ch/ clean 003.txt

