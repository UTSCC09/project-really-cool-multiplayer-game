paper.PointText.prototype.wordwrap=function(txt,max){
    var lines=[];
    var space=-1;
    times=0;
    function cut(){
        for(var i=0;i<txt.length;i++){
            (txt[i]==' ')&&(space=i);
            if(i>=max){
                (space==-1||txt[i]==' ')&&(space=i);
                if(space>0){lines.push(txt.slice((txt[0]==' '?1:0),space));}
                txt=txt.slice(txt[0]==' '?(space+1):space);
                space=-1;
                break;
                }}check();}
    function check(){if(txt.length<=max){lines.push(txt[0]==' '?txt.slice(1):txt);txt='';}else if(txt.length){cut();}return;}
    check();
    return this.content=lines.join('\n');
}


var cardCorner = new Point(100, 100);

var pointTextLocation = new paper.Point(5,20);
var myText = new paper.PointText(cardCorner + pointTextLocation);
myText.fillColor = 'black';
myText.wordwrap("This is a test, testicals and shit are cool, eat my testical if you're feeling lucky punk", 30);

var card = new Path.Rectangle(cardCorner, 150, 200);
card.fillColor = '#e9e9ff';

myText.bringToFront();