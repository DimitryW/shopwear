// wear.html infinite scroll

// page
let page = 0;
// 觸發條件後的回呼函式
let showWear = (entry) => {
    if (window.location.pathname !== "/wear") { return }
    if (entry[0].isIntersecting) {
        console.log("SCROLL showWear OK")

        if (page != null) {
            src = "/api/wears?page=" + page;

            fetch(src)
                .then((response) => {
                    return response.json();
                })
                .then((result) => {
                    page = result["next_page"];
                    if (result.error) { // 先確認有無此資料
                        console.log("WEAR NO OK")
                        observer.unobserve(target); // 沒有資料的話記得要關閉observer，不然之後很難再打開
                    } else {
                        let photoWrapper = document.createElement("div");
                        photoWrapper.className = "pics-set";
                        let photoCount = 1;
                        for (let i in result.data) {
                            data = result["data"][i]
                            let id = data["id"];
                            let photo = data["photo"];
                            let photo_sticker = data["photo_sticker"];
                            // let member = data["member_id"];
                            let member_nickname = data["member_nickname"];
                            let member_name = data["member_name"];
                            // let caption = data["caption"];

                            let photoBox = document.createElement("div");
                            let aTag = document.createElement("a");
                            let wrapper = document.createElement("div");
                            let nameBox = document.createElement("div");
                            let mem_photo = document.createElement("img");
                            let name = document.createElement("div");
                            let img = document.createElement("img");
                            // let spinner = document.createElement("div");
                            // spinner.id = "wear-spinner";

                            photoBox.id = "pic" + photoCount;
                            aTag.href = "/wear/" + id;
                            wrapper.id = "wear-member-name";
                            if (data["photo_sticker"] === null) {
                                mem_photo.src = "../static/photo/member-icon-1.png";
                            } else {
                                mem_photo.src = "https://d1pxx4pixmike8.cloudfront.net/mywear/photo_sticker/" + photo_sticker;
                            }
                            name.innerHTML = member_nickname !== null ? member_nickname : member_name;
                            mem_photo.id = "wear-photo-sticker";
                            img.src = "https://d1pxx4pixmike8.cloudfront.net/mywear/" + photo;

                            nameBox.appendChild(mem_photo);
                            nameBox.appendChild(name);
                            wrapper.appendChild(nameBox)
                            aTag.appendChild(wrapper);
                            aTag.appendChild(img);
                            // aTag.appendChild(spinner);
                            img.onload = () => {
                                // spinner.style.display = "none";
                                document.getElementById("wear-lds").style.display = "none";
                            }

                            photoBox.appendChild(aTag);
                            photoWrapper.appendChild(photoBox);
                            photoCount++;
                        }

                        document.getElementById("wear-pics").appendChild(photoWrapper)
                    }
                })
                // 沒有下一頁時停止observe
        } else {
            observer.unobserve(wearTarget);
            console.log("unobserved");
        };
    }
}

// 觸發條件
let options = { rootMargin: '20px', threshold: 0, };
// 建立 IntersectionObserver物件
let observer = new IntersectionObserver(showWear, options);
const wearTarget = document.getElementById("wear-end"); // observer的target
if (window.location.pathname === "/wear") {
    observer.observe(wearTarget); // 開啟觀察目標
}


// mywear.html infinite scroll
let stickerSrc = "../static/photo/member-icon1.png";

let p = 0;
// 觸發條件後的回呼函式
let showMyWear = (entry) => {
    if (window.location.pathname.split("/")[1] !== "mywear") { return }
    // console.log("p: " + p)
    if (entry[0].isIntersecting) {
        console.log("SCROLL showWear OK")
        memberId = window.location.pathname.split("/")[2];
        if (p != null) {
            src = "/api/mywear?member=" + memberId + "&page=" + p;

            fetch(src)
                .then((response) => {
                    return response.json();
                })
                .then((result) => {
                    p = result["next_page"];
                    if (result.error) {
                        document.getElementById("mywear-lds").style.display = "none";
                        console.log("WEAR NO OK")
                        observer.unobserve(target);
                    } else {
                        if (result["member_photo"] !== null) {
                            stickerSrc = "https://d1pxx4pixmike8.cloudfront.net/mywear/photo_sticker/" + result["member_photo"];
                            document.getElementById("photo-sticker").src = stickerSrc;
                        }

                        document.getElementById("member-name").innerHTML = result["nickname"] !== null ? result["nickname"] : result["member_name"];
                        document.getElementById("post-count").innerHTML = result["total_post"] + " 則貼文";
                        if (result["total_page"] === 0) {
                            document.getElementById("mywear-lds").style.display = "none";
                            observer.unobserve(myWeartarget);
                            console.log("unobserved");
                            return
                        }
                        let photoWrapper = document.createElement("div");
                        photoWrapper.className = "three-pics";
                        for (let i in result.data) {
                            data = result["data"][i]
                            let id = data["id"];
                            let photo = data["photo"];
                            let member = data["member_id"];
                            let caption = data["caption"];

                            let photoBox = document.createElement("div");
                            let aTag = document.createElement("a");
                            let img = document.createElement("img");

                            // photoBox.id = "pic" + photoCount;
                            aTag.href = "/wear/" + id;
                            img.src = "https://d1pxx4pixmike8.cloudfront.net/mywear/" + memberId + "/" + photo;
                            img.onload = () => {
                                document.getElementById("mywear-lds").style.display = "none";
                            }
                            aTag.appendChild(img);
                            photoBox.appendChild(aTag);
                            photoWrapper.appendChild(photoBox);
                        }

                        document.getElementById("mywear-pics").appendChild(photoWrapper)
                    }
                })
        } else {
            observer.unobserve(myWeartarget);
            console.log("unobserved");
        };
    }
}

// 觸發條件
let myWearOptions = {
    rootMargin: '20px',
    threshold: 0,
};
// 建立 IntersectionObserver物件
let myWearobserver = new IntersectionObserver(showMyWear, myWearOptions);
const myWeartarget = document.getElementById("mywear-end");
if (window.location.pathname.split("/")[1] === "mywear") {
    myWearobserver.observe(myWeartarget);
}

function dataURLtoBlob(dataurl) {
    var arr = dataurl.split(','),
        mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]),
        n = bstr.length,
        u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
}

function dataURLtoFile(dataurl, filename) {
    var arr = dataurl.split(','),
        mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]),
        n = bstr.length,
        u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
}
//mywear上傳大頭貼
const submitPhotoSticker = async() => {
    document.getElementById("mw-sticker-lds").style.display = 'block';
    document.getElementById("mywear-backdrop").style.display = 'block';
    let formData = new FormData();
    let file = document.getElementById('media-input');
    let canvas = document.getElementById('c-sticker');
    let dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    let blob = dataURLtoBlob(dataUrl);
    // formData.append("pic", file.files[0]);
    formData.append("pic", blob);
    let res = await fetch("/api/mywear/photo_sticker", {
        method: 'POST',
        body: formData
    })
    let data = await res.json()
    let photoSticker = document.getElementById("photo-sticker");
    if (data["error"]) {
        console.log(data["message"]);
    } else {
        photoSticker.src = "https://d1pxx4pixmike8.cloudfront.net/mywear/photo_sticker/" + data["pic_src"];
        document.getElementById("m-c-upload").style.display = "none";
        document.getElementById("m-c-cancel").style.display = "none";
        document.getElementsByClassName("media-overlay")[0].style.display = "none";
        document.getElementById("indicator").style.display = "none";
        document.getElementById("mw-sticker-lds").style.display = 'none';
        document.getElementById("mywear-backdrop").style.display = 'none';
    }
}

// mywear.html PO文視窗
const showSubmitWindow = () => {
    document.getElementById('submit-window-block').style.display = 'flex';
    document.getElementById('upload-container-1').style.display = 'flex';
    document.getElementById("wear-upload-msg").innerHTML = "";
    document.getElementById("selected-item-1").innerHTML = "";
    document.getElementById("selected-item-2").innerHTML = "";
    document.getElementById("mywear-backdrop").style.display = 'block';

}
const nextStep = (prev, next) => {
    if (document.getElementById('file-upload').value === "") {
        document.getElementById("wear-upload-msg").style.display = 'block';
        document.getElementById("wear-upload-msg").innerHTML = "請選擇照片";
        return
    }
    document.getElementById("wear-upload-msg").style.display = 'none';
    document.getElementById(prev).style.display = 'none';
    document.getElementById(next).style.display = 'flex';
}
const switchBtnPrev = () => {
    let btn = document.getElementById('c1-prev');
    if (btn.style.display === 'block') {
        btn.style.display = 'none';
    } else {
        btn.style.display = 'block';
    }

}
const switchBtnNext = (status) => {
    let btn1 = document.getElementById('c1-next');
    let btn2 = document.getElementById('upload-btn');
    if (status === "none") {
        btn1.style.display = 'none';
        btn2.style.display = 'block';
    } else {
        btn1.style.display = 'block';
        btn2.style.display = 'none';
    }

}

const closeSubmitWindow = () => {
    document.getElementById('file-upload').value = "";
    document.getElementById('mw-upload-lds').style.display = "none";
    document.getElementById('submit-window-block').style.display = 'none';
    document.getElementById("preview-container").style.zIndex = 0;
    document.getElementById("file-ip-1-preview").removeAttribute('src');
    document.getElementById("file-ip-1-preview").style.display = 'none';
    document.getElementById("preview-cncl-btn").style.display = 'none';
    document.getElementById("upload-container-1").style.display = 'flex';
    document.getElementById("upload-container-2").style.display = 'none';
    document.getElementById("upload-container-3").style.display = 'none';
    document.getElementById("upload-backdrop").style.display = 'none';
    document.getElementById("mywear-backdrop").style.display = 'none';
    switchBtnNext("");
    switchBtnPrev();
    nextStep('upload-container-2', 'upload-container-1');
}




const showPreview = (event) => {
    if (event.target.files.length > 0) {
        let src = URL.createObjectURL(event.target.files[0]);
        document.getElementById("wear-upload-msg").style.display = 'none';
        document.getElementById("preview-cncl-btn").style.display = 'block';
        document.getElementById("preview-container").style.zIndex = 4;
        document.getElementById("file-ip-1-preview").src = src;
        document.getElementById("file-ip-1-preview").style.display = "block";
    }
}
const closePreviewImg = () => {
    document.getElementById('file-upload').value = "";
    document.getElementById("preview-container").style.zIndex = 0;
    document.getElementById("file-ip-1-preview").removeAttribute('src');
    document.getElementById("file-ip-1-preview").style.display = 'none';
    document.getElementById("preview-cncl-btn").style.display = 'none';
    document.getElementById("mw-upload-lds").style.display = 'none';
    document.getElementById("selected-item-1").innerHTML = "";
    document.getElementById("selected-item-2").innerHTML = "";
}

// 搭配的產品項目
const selectedItem = (id, name) => {
    let wrapper = document.createElement("div");
    let close = document.createElement("img");
    let item = document.createElement("div");
    close.src = "../static/photo/close.png";
    close.onclick = () => {
        wrapper.remove();
    }
    item.id = id;
    item.textContent = name;
    wrapper.appendChild(close);
    wrapper.appendChild(item);
    document.getElementById("selected-item-1").appendChild(wrapper);
    document.getElementById("selected-item-2").appendChild(wrapper.cloneNode(true));
    document.getElementById("cate-catalogue").innerHTML = "";
    nextStep('upload-container-3', 'upload-container-2');
}

const closeCate = () => {
    document.getElementById("cate-catalogue").innerHTML = "";
}

//select category
const selectProduct = async(subcategory) => {
    let apiAddress = "/api/selectproducts?subcategory=" + subcategory;
    let res = await fetch(apiAddress);
    let data = await res.json();
    document.getElementById("cate-catalogue").innerHTML = "";

    for (i of data["data"]) {
        let box = document.createElement("div");
        let spinner = document.createElement("div");
        let img = document.createElement("img");
        let name = document.createElement("div");
        // let price = document.createElement("div");
        let id = i["id"];
        let itemName = i["product_name"];
        box.id = "sub-item" + id;
        box.onclick = () => {
            console.log(id);
            selectedItem(id, itemName);

        }
        spinner.id = "spinner";
        img.src = "https://d1pxx4pixmike8.cloudfront.net/shopwear/" + i["photo"];
        name.textContent = i["product_name"];
        name.id = "sub-item-name";
        // price.textContent = "NT$ " + i["price"];
        // price.id = "price";
        img.onload = () => {
            img.style.display = "block";
            spinner.style.display = "none";
        }
        box.appendChild(spinner);
        box.appendChild(img);
        box.appendChild(name);
        // box.appendChild(price);
        document.getElementById("cate-catalogue").appendChild(box);
    }
}

// mywear.html 上傳檔案
const submitMywear = async() => {
    document.getElementById("mw-upload-lds").style.display = 'block';
    document.getElementById("upload-backdrop").style.display = 'block';
    let formData = new FormData();
    let file = document.getElementById("file-upload");
    formData.append("pic", file.files[0]);
    let itemIds = [];
    let items = document.getElementById('selected-item-1').children
    if (items.length !== 0) {
        for (i of items) {
            // console.log(i)
            itemIds.push(i.children[1].id)
        }
        // console.log("ITEM")
        // console.log(itemIds)
        formData.append("id", itemIds);
    }
    formData.append("caption", "");
    let res = await fetch("/api/mywear/upload", {
        method: "POST",
        body: formData
    });
    let data = await res.json();
    if (data["ok"]) {
        closeSubmitWindow();
        window.location.reload();
        document.getElementById("upload-backdrop").style.display = "none";
    }
    console.log(data);
}

//WEAR單頁資料
// update Like API
const updateLike = async() => {
    let wear_id = document.getElementById('wear_id').innerHTML;
    let like_stat = document.getElementsByClassName('like-text')[0].innerHTML;
    let body = {
        "wear_id": wear_id,
        "like_stat": like_stat
    }
    let data = await fetch("/api/like", { method: "POST", headers: headers, body: JSON.stringify(body) });
    let res = await data.json();
    if (res["ok"]) {
        console.log("已更新LIKE");
        document.getElementById("like-count").innerHTML = res["likes"] + " 個讚"
    }
}

// Like button
const createDOMFromString = (domString) => {
    const div = document.createElement('div')
    div.innerHTML = domString
    return div
}

class LikeButton {
    constructor() {
        this.state = { isLiked: false }
    }

    changeLikeText() {
        const likeText = this.element.querySelector('.like-text')
        const likeIcon = this.element.querySelector('.like-icon')
        this.state.isLiked = !this.state.isLiked
        likeText.innerHTML = this.state.isLiked ? 'liked' : 'noLike'
        likeIcon.innerHTML = this.state.isLiked ? '❤️' : '🤍'
        console.log(this.state.isLiked)
        updateLike();
    }


    render() {
        this.element = createDOMFromString(`
          <button class='like-button'>
          <span class='like-text'>noLike</span>
          <span class='like-icon'>🤍</span>
          </button>
        `)
        this.element.addEventListener('click', this.changeLikeText.bind(this), false)
            // this.element.addEventListener('click', this.changeLikeIcon.bind(this), false)
        return this.element
    }

    removeListener() {
        button.removeEventListener('click', this.boundEventHandler)
    }
}


// 顯示貼文詳細資料
const showWearDetail = async() => {
    let apiAddress = "/api/wear/" + window.location.pathname.split("/")[2];
    let res = await fetch(apiAddress);
    let data = await res.json();
    document.getElementById("wear_id").textContent = data["id"];
    document.getElementById("member_id").textContent = data["member_id"];
    document.getElementById("member_nickname").href = "/mywear/" + data["member_id"];
    document.getElementById("wear-single-member").href = "/mywear/" + data["member_id"];
    document.getElementById("member_nickname").textContent = data["member_nickname"] !== null ? data["member_nickname"] : data["member_name"];
    if (data["photo_sticker"] !== null) { document.getElementById("photo-sticker").src = "https://d1pxx4pixmike8.cloudfront.net/mywear/photo_sticker/" + data["photo_sticker"]; };
    // document.getElementById("product_id").textContent = data["product_id"];
    document.getElementById("caption").textContent = data["caption"];

    if (data["user_id"] === data["member_id"]) {
        document.getElementById("delete-dots").style.display = "block";
    }

    // let imgList = data["photo"];
    let photo = data["photo"][0];
    let img = document.createElement("img");
    img.src = "https://d1pxx4pixmike8.cloudfront.net/mywear/" + photo;
    img.onload = () => {
        document.getElementById("lds-fb").style.display = "none";
    }
    document.getElementById("wear-single-photo").appendChild(img);

    for (j in data["product_photos"]) {
        let box = document.createElement("a");
        let img = document.createElement("img");
        let span = document.createElement("span");
        img.src = "https://d1pxx4pixmike8.cloudfront.net/shopwear/" + data["product_photos"][j];
        span.textContent = data["product_photos"][j].split("/")[0];
        box.href = "/product/" + data["product_id"][j];
        box.appendChild(img);
        box.appendChild(span);
        document.getElementById("wear-products").appendChild(box);
    }

    // render likeButton status
    let likeWrapper = document.getElementById("like-wrapper");
    let likeButton1 = new LikeButton();
    likeWrapper.appendChild(likeButton1.render());
    if (data["user_like"] === 1) {
        document.getElementsByClassName('like-icon')[0].innerHTML = '❤️';
        likeButton1.state.isLiked = true;
    }
    document.getElementById("like-count").innerHTML = data["likes"] + " 個讚"

    showOtherWears(data["member_id"]);
}


// 顯示其他貼文
const showOtherWears = async(memberId) => {
    let otherWears = document.getElementById("other-wears");
    apiAdress = "/api/mywear" + "?member=" + memberId + "&page=0";
    let res = await fetch(apiAdress);
    let result = await res.json();
    for (i in result["data"]) {
        data = result["data"][i]
        let id = data["id"];
        let photo = data["photo"];

        let photoBox = document.createElement("div");
        let aTag = document.createElement("a");
        let img = document.createElement("img");
        aTag.href = "/wear/" + id;
        img.src = "https://d1pxx4pixmike8.cloudfront.net/mywear/" + memberId + "/" + photo;
        aTag.appendChild(img);
        photoBox.appendChild(aTag);
        otherWears.appendChild(photoBox);
    }
}

// 未登入時跳出訊息
const backdrop = () => {
    document.getElementById('ws-login').style.display = "block";
    setTimeout(function() {
        document.getElementById('ws-login').style.display = "none";
    }, 1500)
}

// 刪除貼文
const deleteWear = async() => {
    let wearId = document.getElementById("wear_id").innerHTML;
    let memberId = document.getElementById("member_id").innerHTML;
    apiAdd = "/api/wear/" + wearId;
    let body = {
        "member_id": memberId
    }
    let data = await fetch(apiAdd, { method: "DELETE", headers: headers, body: body })
    let res = await data.json();
    if (res["ok"]) {
        window.location = "/mywear/" + memberId;
    }
}

// 顯示貼文刪除圖示
if (window.location.pathname.split("/")[1] === "wear" && window.location.pathname.split("/").length === 3) {
    document.getElementById("delete-dots").addEventListener("click", () => {
        document.getElementById("ws-delete").style.display = "block";
        document.getElementById("wear-single-backdrop").style.display = "block";
    });
    document.getElementById("ws-delete-cancl").addEventListener("click", () => {
        document.getElementById("ws-delete").style.display = "none";
        document.getElementById("wear-single-backdrop").style.display = "none";
    });
    document.getElementById("ws-delete-confm").addEventListener("click", deleteWear);
}