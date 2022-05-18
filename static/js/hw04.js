const SERVER_URL = "https://photo-app-dy.herokuapp.com"


const story2Html = story => {
    return `
        <div class="story_panel_unit">
            <img class="story_panel_unit_pic"  src="${ story.user.thumb_url }" class="pic" alt="profile pic for ${ story.user.username }" />
            <div class="story_panel_unit_name">${ story.user.username }</div>
        </div>
    `;
};

const displayStories = () => {
    fetch(SERVER_URL + '/api/stories')
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
    fetch(SERVER_URL + '/api/profile')
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
            <button class="suggestions_unit_follow" 
                    data-user-id="${ suggest.id }" 
                    onclick="HandleFollow(event)"
                    aria-label="Follow"
                    aria-checked="false"
            >follow</button>
        </div>
    `;
};

const displaySuggestions = () => {
    fetch(SERVER_URL + '/api/suggestions')
        .then(response => response.json())
        .then(suggestions => {
            const html = suggestions.map(suggestion2Html).join('\n');
            document.querySelector('.suggestions_content').innerHTML = html;
        })
};



const post2Html = (post, currentUserID) => {
    let comments = `
                <a class="card_content_comments_viewall" href="#">
                    View all ${post.comments.length} comments
                </a>
                `;
    if (post.comments.length >= 1) {
        comments += `
                <div class="card_content_comments_unit">
                    <span class="card_content_comments_unit_name">${ post.comments[0]?.user.username }</span>
                    ${ post.comments[0]?.text }
                </div>
                `;
    }

    let like = `far`, likeChecked = "false";
    if (post.likes.filter(e => e.user_id === parseInt(currentUserID, 10)).length > 0) {
        like = `fas`;
        likeChecked = "true";
    }

    let bookmark = `far`, bookmarkChecked = "false";
    // if (post.likes.filter(e => e.user_id === parseInt(currentUserID, 10)).length > 0) {
    //     like = `fas`;
    //     likeChecked = "true";
    // }

    return `
        <div class="card">
            <div class="card_header">
                <div class="card_header_name">${ post.user.username }</div>
                <i class="fas fa-ellipsis-h card_header_icon"></i>
            </div>
    
            <img class="card_img" src="${ post.image_url }" alt="card_img_${ post.user.username }">
    
            <div class="card_content">
                <div class="card_content_icons">
                    <i class="${ like } fa-heart card_content_icons_icon" 
                       data-post-id="${ post.id }" 
                       onclick="HandleLike(event)"
                       aria-checked="${ likeChecked }"></i>
                    <i class="far fa-comment card_content_icons_icon"></i>
                    <i class="far fa-paper-plane card_content_icons_icon"></i>
                    <i class="${ bookmark } fa-bookmark card_content_icons_bookmark"
                       data-post-id="${ post.id }"
                       onclick="HandleBookmark(event)"
                       aria-checked="${ bookmarkChecked }"></i>
                </div>
    
                <span class="card_content_like_num" id="like_num_${ post.id }">${ post.likes.length }</span>
                <span class="card_content_like">likes</span>
    
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
                    <input class="card_add_comment_input_textbox" id="comment_input" type="text" placeholder="Add a comment..." />
                </label>
    
                <button class="card_add_comment_submit" 
                        onclick="HandleComment(event)"
                        data-post-id="${ post.id }">
                    Post
                </button>
            </div>
        </div>
    `;
};

const displayPosts = (currentUserID) => {
    fetch(SERVER_URL + '/api/posts')
        .then(response => response.json())
        .then(posts => {
            const html = posts.map(p => post2Html(p, currentUserID)).join('\n');
            document.querySelector('.posts_content').innerHTML = html;
        })
};



const initPage = (currentUserID) => {
    displayStories();
    displayProfile();
    displaySuggestions();
    displayPosts(currentUserID);
};

// invoke init page to display stories:
initPage(userInfo);



const HandleFollow = (event) => {
    const elem = event.currentTarget;
    if (elem.getAttribute('aria-checked') === 'false') {
        followUser( elem.dataset.userId, elem );
    } else {
        unfollowUser( elem.dataset.followingId, elem);
    }
}

const followUser = ( uid, elem ) => {
    const postData = {
        "user_id": uid
    }

    fetch(SERVER_URL + '/api/following', {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData)
    })
    .then(response => response.json())
    .then(data => {
        console.log(data)
        elem.innerHTML = 'unfollow';
        elem.classList.add('suggestions_unit_unfollow');
        elem.classList.remove('suggestions_unit_follow');
        // elem.setAttribute('aria-label', "Unfollow");
        elem.setAttribute('aria-checked', 'true');
        elem.setAttribute('data-following-id', data.id);
    })
}

const unfollowUser = ( uid, elem ) => {
    fetch(SERVER_URL + `/api/following/${uid}`, {
        method: "DELETE",
    })
    .then(response => response.json())
    .then(data => {
        console.log(data)
        elem.innerHTML = 'follow';
        elem.classList.add('suggestions_unit_follow');
        elem.classList.remove('suggestions_unit_unfollow');
        // elem.setAttribute('aria-label', "Unfollow");
        elem.setAttribute('aria-checked', 'false');
        elem.removeAttribute('data-following-id');
    })
}



const HandleLike = (event) => {
    const elem = event.currentTarget;
    if (elem.getAttribute('aria-checked') === 'false') {
        likePost( elem.dataset.postId, elem );
    } else {
        unlikePost( elem.dataset.likeId, elem, elem.dataset.postId);
    }
}

const likePost = ( pid, elem ) => {
    const postData = {
        "post_id": pid
    }

    fetch(SERVER_URL + '/api/posts/likes', {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData)
    })
    .then(response => {
        if (response.ok) {
            response.json().then(data => {
                console.log(data)
                elem.classList.remove('far');
                elem.classList.add('fas');
                elem.setAttribute('aria-checked', 'true');
                elem.setAttribute('data-like-id', data.id);

                const likeElem = document.querySelector(`#like_num_${pid}`);
                likeElem.innerText = parseInt(likeElem.innerText, 10) + 1;
            })
        } else {
            response.json().then(data => console.log("Error:", data))
        }
    })
}

const unlikePost = ( lid, elem, pid ) => {
    fetch(SERVER_URL + `/api/posts/likes/${lid}`, {
        method: "DELETE",
    })
    .then(response => {
        if (response.ok) {
            response.json().then(data => {
                console.log(data)
                elem.classList.remove('fas');
                elem.classList.add('far');
                elem.setAttribute('aria-checked', 'false');
                elem.removeAttribute('data-like-id');

                const likeElem = document.querySelector(`#like_num_${pid}`);
                likeElem.innerText = parseInt(likeElem.innerText, 10) - 1;
            })
        } else {
            response.json().then(data => console.log("Error:", data))
        }
    })
}



const HandleBookmark = (event) => {
    const elem = event.currentTarget;
    if (elem.getAttribute('aria-checked') === 'false') {
        addBookmark(elem.dataset.postId, elem);
    } else {
        removeBookmark(elem.dataset.bookmarkId, elem);
    }
}

const addBookmark = ( pid, elem ) => {
    const postData = {
        "post_id": pid
    }

    fetch(SERVER_URL + '/api/bookmarks', {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData)
    })
    .then(response => {
        if (response.ok) {
            response.json().then(data => {
                console.log(data)
                elem.classList.remove('far');
                elem.classList.add('fas');
                elem.setAttribute('aria-checked', 'true');
                elem.setAttribute('data-bookmark-id', data.id);
            })
        } else {
            response.json().then(data => console.log("Error:", data))
        }
    })
}

const removeBookmark = ( bid, elem ) => {
    fetch(SERVER_URL + `/api/bookmarks/${bid}`, {
        method: "DELETE",
    })
    .then(response => {
        if (response.ok) {
            response.json().then(data => {
                console.log(data)
                elem.classList.remove('fas');
                elem.classList.add('far');
                elem.setAttribute('aria-checked', 'false');
                elem.removeAttribute('data-bookmark-id');
            })
        } else {
            response.json().then(data => console.log("Error:", data))
        }
    })
}



const HandleComment = (event) => {
    const elem = event.currentTarget;
    if (document.querySelector("#comment_input").value.length > 0) {
        addComment( elem.dataset.postId, elem );
    }
}

const addComment = ( pid, elem ) => {
    const postData = {
        "post_id": pid,
        "text": document.querySelector("#comment_input").value
    }

    fetch(SERVER_URL + '/api/comments', {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData)
    })
    .then(response => {
        if (response.ok) {
            response.json().then(data => {
                console.log(data)
                document.querySelector("#comment_input").value = '';
                elem.setAttribute('data-comment-id', data.id);
            })
        } else {
            response.json().then(data => console.log("Error:", data))
        }
    })
}

const removeComment = ( lid, elem, pid ) => {
    fetch(SERVER_URL + `/api/comments/${lid}`, {
        method: "DELETE",
    })
    .then(response => {
        if (response.ok) {
            response.json().then(data => {
                console.log(data)
                elem.removeAttribute('data-comment-id');
            })
        } else {
            response.json().then(data => console.log("Error:", data))
        }
    })
}