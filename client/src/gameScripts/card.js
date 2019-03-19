// paper.PointText.prototype.wordwrap=function(txt,max){
//     var lines=[];
//     var space=-1;
//     times=0;
//     function cut(){
//         for(var i=0;i<txt.length;i++){
//             (txt[i]==' ')&&(space=i);
//             if(i>=max){
//                 (space==-1||txt[i]==' ')&&(space=i);
//                 if(space>0){lines.push(txt.slice((txt[0]==' '?1:0),space));}
//                 txt=txt.slice(txt[0]==' '?(space+1):space);
//                 space=-1;
//                 break;
//                 }}check();}
//     function check(){if(txt.length<=max){lines.push(txt[0]==' '?txt.slice(1):txt);txt='';}else if(txt.length){cut();}return;}
//     check();
//     return this.content=lines.join('\n');
// }

export default class PaperCards {
    paper;
    window;
    constructor(paper, window) {
        this.paper = paper;
        this.window = window;
        paper.install(window);
        window.onload = function() {
            paper.setup('gameCanvas');
            var path = new paper.Path.Rectangle([75, 75], [100, 100]);
            path.strokeColor = 'black';
        
            paper.view.onFrame = function(event) {
                // On each frame, rotate the path by 3 degrees:
                path.rotate(3);
            }

            var rect = new paper.Path.Rectangle({
                point: [0, 0],
                size: [paper.view.size.width, paper.view.size.height],
                strokeColor: 'white',
                selected: true
            });
            rect.sendToBack();
            rect.fillColor = '#ff0000';
            let tablePadding = 200
            let TLCorner = new paper.Point(tablePadding, tablePadding)
            let BRCorner = new paper.Point(
                (paper.view.size.width)-tablePadding, 
                (paper.view.size.height)-tablePadding)
                let table = new paper.Path.Rectangle(TLCorner, BRCorner);
            table.fillColor = '#fff3e6';
            }
    }
        

    }