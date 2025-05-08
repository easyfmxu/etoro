#bash sh/stoBook.sh book-34689 56 #妖受
#bash sh/stoBook.sh book-26345 145 #日出东方
#bash sh/stoBook.sh book-218447 597 #金牌律师
#bash sh/stoBook.sh book-181710 145 #余情可待
#bash sh/stoBook.sh book-195847 163 #怦然为你

book=$1
pages=$2

#original/ -> All.text => ch => en
#node js/sto-book.js book=$book c=$pages #original/
node js/combine.js fr=$book  #All.txt
node js/split-sto.js fr=$book #ch/ by 第
#node js/splitjs fr=$book 
node js/clean-sto.js fr=$book #ch/ clean 003.txt

