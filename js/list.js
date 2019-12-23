$(document).ready(function(){
    var currentDay = new Date();
    var finalDay = new Date('2019-12-31');
    
    if(currentDay > finalDay){  // 투표끝
        $('#list').css({
            'height': '100%',
            'display': 'block',
            'position': 'absolute'
        });
        $('<div>').css({
            'color': 'white',
            'font-size': 'xx-large',
            'text-align': 'center',
            'height': '100%',
            'background': "url('https://t1.daumcdn.net/cfile/tistory/99D59C465C6FFAAA35') center no-repeat"
        }).text('투표가 종료되었습니다. 결과가 나올때까지 기다려주세요.').appendTo($('#list'));
        return;
    }        
    
    //1160
    var resizeTop = function(){
        var top = $('.top-wrap .title-con .title-img');
        top.addClass('normal');
        var h = Math.min(top.height() * $('.top-wrap .title-con .title-img').width() / 1160, 571);
        top.height(h);
        $('#list').css('top', h);
    };
    resizeTop();
    //$(window).resize(resizeTop);
            
	var items = [];
	var contentHeight;
	var createRowCnt = 0;
	var selectedIdx = [];
	var selectedItem = [];
	var MAXSELECTCNT = 9;
	
	var wrapper = $("<div>")
		.addClass("wrapper")
		.height(window.innerHeight)
		.appendTo($("#list"));	
		
	var scroller = $("<div>")
		.addClass("scroller")
		.appendTo(wrapper);	
		
	var selectedPanel = $("<div>")
		.addClass("panel")
		.appendTo("body");
		
	var selectMenu = $("<div>")
		.addClass("selectMenu")
		.on("click", function() {
			selectedPanel.toggleClass("open");
		})
		.appendTo("body");
		
	var itemPanel = $("<div>")
		.addClass("itemPanel")
		.appendTo(selectedPanel);
		
	var final = $("<div>")
        .html("<h1> VOTE </h1>")
        .addClass("final");
	
    var finalVote = function(){        
        var allData = $.param({ "entry.1970718121": selectedIdx}, true);
        $.ajax({
             url:"https://docs.google.com/forms/d/e/1FAIpQLSeKKZ6pFRER8MUTKwUA4Tt_QxFWncsbLnIYD6RYKx8V8PJQzA/formResponse",
             data: allData,
             type:"POST"
        }).always(function(jqXHR, textStatus) {
            alert('투표가 완료되었습니다. 참여해주셔서 감사합니다.');
            $('body').remove();
            location.href = 'https://twitter.com/intent/tweet?text=나는 투짅의 노예임을 선언합니다.&url=https://loona2jin.github.io/';
        });
       }
    
	for(var i = 0; i < 9; i++) {
		selectedItem.push(
			$("<div>")
				.addClass("selectedItem")
				.attr("id", "selectedPanel" + i)
				.css({
					"width": ((Math.min(selectedPanel.width(), 500)) / 2.5),
					"height": ((Math.min(selectedPanel.width(), 500)) / 2.5)
				})
                .on('click', function(evt){
                    $('.mediaSelect').each(function(idx, el){
                        if(el.style["background-image"] == evt.target.style["background-image"]){
                            $(el).removeClass('mediaSelect');
                            $(el).parent('.content').removeClass('elSelect');
                            $(el).siblings('input').prop("checked", false);
                        }
                    });
                    
                    selectedIdx.splice(this.id.substr(13,1), 1);
                    changePanelItems();
                })
				.appendTo(itemPanel)
			);
	}
	
    try{
        $.getJSON("js/data.json", function(data) {
            // 2개씩 저장		
            for(var i = 0; i < data.length / 2; i++) {
                items[i] = data.slice(i * 2, i * 2 + 2);
            }		

            loadCompleteJSON();
        });
    } catch(e) {
        console.log("json로드 실패");    
    }
	
	var requestData = function(start, count) {
		var result = items.slice(start, start + count);	
		
		this.updateCache(start, result);
	};
	
	var updateContent = function(el, data) {
		if(data) {
			var setData = function(obj, num){
                var element = obj[num];
                var elInput = $(element.getElementsByTagName("input")[0]);
                var elMedia = $(element.getElementsByClassName("media")[0]);
                var elTitle = $(element.getElementsByClassName("title")[0]);
				
                elMedia.css({"background": ""});
                
				var changeSelectedPanel = function() {
					if(selectedIdx.length){
						selectMenu.css("display", "block");
					} else {
						selectMenu.css("display", "none");
						if(selectedPanel.hasClass("open")) {
							selectedPanel.removeClass("open");
						}
					}
				};
				
				changeSelectedPanel();
				
                if(data[num]){
                    if(selectedIdx.indexOf(data[num].no) != -1) {
                        elInput.prop("checked", true);
                        elMedia.addClass("mediaSelect");
                        $(element).addClass("elSelect");
                    } else {
                        elInput.prop("checked", false);
                        elMedia.removeClass("mediaSelect");
                        $(element).removeClass("elSelect");
                    }

                    //
                    if(data[num].mov) {
                        $(elMedia[0].getElementsByClassName('video-js')[0]).css('display','block');
                        elMedia[0].getElementsByClassName('video-js')[0].player.poster(data[num].data);
                        elMedia[0].getElementsByClassName('video-js')[0].player.src(data[num].mov);
                        if(!data[num].link)
                            elMedia[0].getElementsByClassName('video-js')[0].player.options_.autoplay = true;
                        else
                            elMedia[0].getElementsByClassName('video-js')[0].player.options_.autoplay = false;
                    } else {
                        $(elMedia[0].getElementsByClassName('video-js')[0]).css('display','none');
                        elMedia[0].getElementsByClassName('video-js')[0].player.pause();
                        elMedia.css({"background": "no-repeat center url("+data[num].data+")","background-size":"contain"});
                    }
                    
                    elTitle.text(data[num].no + "-" + data[num].title).off("click").on("click", function(){
                        if(data[num].link){
                            window.open(data[num].link);
                        } else
                            window.open(data[num].data);
                    });
                    elInput.off("click").on("click", function(){
                        if($(this).is(":checked")){
                            if(selectedIdx.length == MAXSELECTCNT) {
                                $(this).prop("checked", false);
                                alert("최대 선택 개수는 " + MAXSELECTCNT + "개 입니다.");
                                if(!$('.panel').hasClass('open'))
                                    $('.selectMenu').click();
                                return;
                            }

                            selectedIdx.push(data[num].no);
                            elMedia.addClass("mediaSelect");
                            $(element).addClass("elSelect");

                            // 선택완료 창
                            if(selectedIdx.length == MAXSELECTCNT) {
                                final.off("click").on("click", finalVote).appendTo("body");
                            } 
                        } else {
                            selectedIdx.splice(selectedIdx.indexOf(data[num].no), 1);
                            elMedia.removeClass("mediaSelect");
                            $(element).removeClass("elSelect");
                            if(selectedIdx.length != MAXSELECTCNT) {
                                final.off("click", finalVote).remove();
                            } 
                        }

                        changeSelectedPanel();	

                        changePanelItems();
                    });
                } 
			};
			
			setData(el.children, 0);
			setData(el.children, 1);
		} 
	};
    
    var changePanelItems = function(){
        $(".selectedItem").text("").css("background", "");	// 초기화
        for(var i = 0; i < selectedIdx.length; i++) {
            if(selectedIdx[i] % 2 == 1)
                selectedItem[i].text(selectedIdx[i]).css({"background": "no-repeat center url("+items[parseInt(selectedIdx[i] / 2)][0].data+")","background-size":"cover"});
            else
                selectedItem[i].text(selectedIdx[i]).css({"background": "no-repeat center url("+items[parseInt(selectedIdx[i] / 2) - 1][1].data+")","background-size":"cover"});
        }
        
        // 선택완료 창
        if(selectedIdx.length == MAXSELECTCNT) {
            final.off("click").on("click", finalVote).appendTo("body");
        } else{
            final.off("click", finalVote).remove();
        }
    }
	
	var createListDom = function(idx) {
		var row = $("<div>")
			.addClass("row")
			.appendTo(".scroller");
			
		var content1 = $("<div>")
			.addClass("content")
			.appendTo(row);
			
		var media1 = $("<div>")
			.addClass("media")
			.appendTo(content1);
        var video1 = $('<video class="video-js" id="video' + idx + '" style="width: 100%;height: 100%;" loop controls>')
			.appendTo(media1);
        var source1 = $('<source type="application/x-mpegURL" src="https://video.twimg.com/ext_tw_video/1203641827284226048/pu/pl/ilGUK5xcftBr8EXz.m3u8">').appendTo(video1);   
		videojs('video'+idx);	
        
		var title1 = $("<div>")
			.addClass("title")
			.appendTo(content1);
			
		var check1 = $("<input>")
			.attr("type", "checkbox")
			.appendTo(content1);
		
		var content2 = $("<div>")
			.addClass("content")
			.appendTo(row);
		
		var media2 = $("<div>")
			.addClass("media")
			.appendTo(content2);
        var video2 = $("<video class='video-js' id='video" + idx + "_' style='width: 100%;height: 100%;' loop controls>")
			.appendTo(media2);
        var source2 = $('<source type="application/x-mpegURL" src="https://video.twimg.com/ext_tw_video/1203641827284226048/pu/pl/ilGUK5xcftBr8EXz.m3u8">').appendTo(video2);  
		videojs('video'+idx+'_');		
        
		var title2 = $("<div>")
			.addClass("title")
			.appendTo(content2);
			
		var check2 = $("<input>")
			.attr("type", "checkbox")
			.appendTo(content2);
			
		contentHeight = Math.min($(".content").width(), 380);
			
		$(row).height(contentHeight);
		$(".content").height(contentHeight * 0.9);
		$(".media").height($(".content").height() * 0.7);
		$(".title").height($(".content").height() * 0.1);
		
		if(!createRowCnt)
			createRowCnt = window.innerHeight / contentHeight + 1;
	};
	
	var loadCompleteJSON = function() {
		var i = 0;
		do {
			createListDom(i);
			i++;
		} while(createRowCnt > i);
		
		var scroll = new IScroll(".wrapper",{
			scrollbars: true,
			mouseWheel: true,
			interactiveScrollbars: true,
			shrinkScrollbars: "scale",
			fadeScrollbars: true,
			infiniteElements: ".row",
			infiniteLimit: items.length,
			dataset: requestData,
			dataFiller: updateContent,
			cacheSize: 20
		});
        
        scroll.on('scroll', function(){
            //$('html, body').scrollTop();
            $('html, body').animate({scrollTop:$('#list').offset().top}, 500, 'swing');
        });
	};
	
//    $(document).scroll(function(e){
//        $('html, body').animate({scrollTop:$('#list').offset().top}, 500, 'swing');
//    });
        $('.top-wrap').click(function(){
            $('html, body').animate({scrollTop:$('#list').offset().top}, 500, 'swing');
        });
});
