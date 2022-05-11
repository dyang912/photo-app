const story2Html = story => {
    return `
        <div class="story_panel_unit">
            <img class="story_panel_unit_pic"  src="${ story.user.thumb_url }" class="pic" alt="profile pic for ${ story.user.username }" />
            <div class="story_panel_unit_name">${ story.user.username }</div>
        </div>
    `;
};

const displayStories = () => {
    fetch('/api/stories')
        .then(response => response.json())
        .then(stories => {
            const html = stories.map(story2Html).join('\n');
            document.querySelector('.story_panel').innerHTML = html;
        })
};


const profile2Html = profile => {
    return `
        <img class="profile_pic" src="${ profile.image_url }" alt="profile pic for ${ profile.username }">
        <h2 class="profile_name">${ profile.username }</h2>
    `;
};

const displayProfile = () => {
    fetch('/api/profile')
        .then(response => response.json())
        .then(profile => {
            const html = profile2Html(profile);
            document.querySelector('.profile').innerHTML = html;
        })
};


const suggestion2Html = suggest => {
    return `
        <div class="suggestions_unit">
            <img class="suggestions_unit_pic" src="${ suggest.image_url }" alt="pic_${ suggest.username }">
            <div class="suggestions_unit_body">
                <div class="suggestions_unit_body_name">${ suggest.username }</div>
                <div class="suggestions_unit_body_text">suggested for you</div>
            </div>
            <a class="suggestions_unit_follow" href="#">follow</a>
        </div>
    `;
};

const displaySuggestions = () => {
    fetch('/api/suggestions')
        .then(response => response.json())
        .then(suggestions => {
            const html = suggestions.map(suggestion2Html).join('\n');
            document.querySelector('.suggestions_content').innerHTML = html;
        })
};


const post2Html = post => {
    var comments = `
                <a class="card_content_comments_viewall" href="#">
                    View all ${ post.comments.length } comments
                </a>
                `
    if (post.comments.length >= 1) {
        comments += `
                <div class="card_content_comments_unit">
                    <span class="card_content_comments_unit_name">${ post.comments[0]?.user.username }</span>
                    ${ post.comments[0]?.text }
                </div>
                `
    }
    return `
        <div class="card">
            <div class="card_header">
                <div class="card_header_name">${ post.user.username }</div>
                <i class="fas fa-ellipsis-h card_header_icon"></i>
            </div>
    
            <img class="card_img" src="${ post.image_url }" alt="card_img_${ post.user.username }">
    
            <div class="card_content">
                <div class="card_content_icons">
                    <i class="far fa-heart card_content_icons_icon"></i>
                    <i class="far fa-comment card_content_icons_icon"></i>
                    <i class="far fa-paper-plane card_content_icons_icon"></i>
                    <i class="far fa-bookmark card_content_icons_bookmark"></i>
                </div>
    
                <div class="card_content_like">${ post.likes.length } likes</div>
    
                <div class="card_content_post">
                    <span class="card_content_post_name">${ post.user.username }</span>
                    ${ post.caption }..
                    <span class="card_content_post_more" >more</span>
                </div>
    
                <div class="card_content_comments">
                    ${ comments }
                </div>
    
                <div class="card_content_time">
                    ${ post.display_time.toUpperCase() }
                </div>
            </div>
    
            <div class="card_add_comment">
                <label class="card_add_comment_input">
                    <i class="far fa-smile card_add_comment_input_icon"></i>label
                    <input class="card_add_comment_input_textbox" type="text" placeholder="Add a comment..." />
                </label>
    
                <a class="card_add_comment_submit" href="#">Post</a>
            </div>
        </div>
    `;
};

const displayPosts = () => {
    fetch('/api/posts')
        .then(response => response.json())
        .then(posts => {
            const html = posts.map(post2Html).join('\n');
            document.querySelector('.posts_content').innerHTML = html;
        })
};


const initPage = () => {
    displayStories();
    displayProfile();
    displaySuggestions();
    displayPosts();
};

// invoke init page to display stories:
initPage();