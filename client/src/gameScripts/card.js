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