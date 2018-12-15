function call_alert(mode, msg){
    if(mode === "success"){
        $('.alert').addClass('alert-success').removeClass('danger').text(msg).fadeOut(3000);
    }else if(mode === "error"){
        $('.alert').addClass('alert-danger').removeClass('alert-success').text(msg).fadeOut(3000);
    }
}
function modal_open(article_id, title){
    console.log(article_id);
    $('#exampleModalCenter').removeClass('fade').show();
    $('.modal-title').text("Comment - " + decodeURIComponent(title));
    $('.modal_submit_btn').attr('data-article-id', article_id);
    $('.comment_content').val("");
    $('.comment_scr').empty();
}
function modal_close(){
    $('#exampleModalCenter').addClass('fade').hide();
    $('.modal-title').text("Comment");
    $('.modal_submit_btn').attr('data-article-id', '');
    $('.comment_content').val("");
    $('.comment_scr').empty();
}
$(document).ready(function(){
    $('.scrape_btn').click();
    /**********************************************************************
     * CLICK TO GET ALL COMMENTS FOR AN ARTICLE AND OPEN MODAL WITH EDITOR
     *********************************************************************/
    $('.comment_btn').on('click', function(){
        var article_id = $(this).attr('data-id');
        var title = $(this).attr('data-title');

        var req_data = {article_id : article_id};
        $.ajax({
            url : "/api/select_comment",
            method : "POST",
            data : req_data
        })
        .then((res_data) => {
            if(res_data.length > 0){
                res_data.map((comment) => {
                    // console.log(comment);
                    var comment_div = $('<div class="border my-3 py-2 pb-3">');
                    var comment_del_btn = $('<button class="comment_del_btn btn btn-danger float-right">');
                    comment_del_btn.attr('data-comment-id', comment._id);
                    comment_del_btn.text("Del");

                    comment_div.html(comment.content);
                    comment_div.append(comment_del_btn);

                    $('.comment_scr').prepend(comment_div);
                })
            }
        })

        modal_open(article_id, title);

    });
    $('.modal_close_btn').on('click', function(){
        modal_close();
    });
    /*********************************
     * CLICK TO SUBMIT COMMENT BUTTON
     *********************************/
    $('.modal_submit_btn').on('click', function(){
        var article_id = $(this).attr('data-article-id');
        var content = $('.comment_content').val();
        var req_data = {article_id : article_id, content : content};
        // console.log("FROM app.js");
        // console.log(req_data);
        $.ajax({
            url : "api/insert_comment",
            method : "POST",
            data : req_data
        })
        .then((res_data) => {
            console.log(res_data);
            $('.comment_content').val("");
            var comment_div = $('<div class="border my-3 py-2 pb-3">');
            var comment_del_btn = $('<button class="comment_del_btn btn btn-danger float-right">');
            comment_del_btn.attr('data-comment-id', res_data._id);
            comment_del_btn.text("Del");

            comment_div.html(res_data.content);
            comment_div.append(comment_del_btn);

            $('.comment_scr').prepend(comment_div);
            call_alert("success", "Comment is succesfully created.");
        })
        
        //modal_close();
    });
    $('.modal').on('click', '.comment_del_btn', function(){
        var this_obj = $(this);
        var comment_id = $(this).attr('data-comment-id');
        var req_data = {comment_id : comment_id};
        $.ajax({
            url : "/api/delete_comment",
            method : "POST",
            data : req_data
        })
        .then((res_data) => {
            if(comment_id === res_data._id){
                this_obj.parent().remove();
                call_alert("success", "Comment is succesfully deleted.");
                return false;
            }else{
                call_alert("error", "Hmm... Something is wrong. Please contact to Admin.");
                return false;
                //id doesn't match. something is wrong
            }
        })
    })
    /*********************************
    * CLICK TO SAVE ARTICLE BUTTON
    *********************************/
    $('.save_article_btn').on('click', function(){
        var this_obj = $(this);
        var title = $(this).attr('data-title');
        var link = $(this).attr('data-link');
        var image = $(this).attr('data-image');
        var category = $(this).attr('data-category');
        var req_data = {title : title, link : link, image : image, category : category};
        $.ajax({
            method: "POST",
            url: "/api/save",
            data: req_data
            })
            .then(function(res_data) {

                if(res_data === "added"){
                    this_obj.removeClass('btn-dark').addClass('btn-success').text("SAVED!!!");
                    this_obj.parent().parent().fadeOut(2000);
                    call_alert("success", "Article is succesfully added.");
                    return false;
                }else{

                }
            });
    });
    /***************************************
     * CLICK TO DELETE SAVED ARTICLE BUTTON
     ****************************************/
    $('.delete_btn').on('click', function(){
        var this_obj = $(this);
        var article_id = $(this).attr('data-id');
        var req_data = {article_id : article_id};
        $.ajax({
            url : "/api/delete_article",
            method : "POST",
            data : req_data
        })
        .then((res_data) => {
            if(article_id === res_data._id){
                this_obj.parent().parent().remove();
                call_alert("success", "Article is succesfully deleted.");
                return false;
            }else{
                call_alert("error", "Hmm... Something is wrong. Please contact to Admin.");
                return false;
                //id doesn't match. something is wrong
            }
        })
    });
})