let headers = {
    "Access-Control-Allow-Origin": "*",
    "Content-type": "application/json"
};


// 建立 Cookie
function getCookie(cname) {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return undefined;
}

//Parse購物車cookie
const showCart = () => {
    let cookie = getCookie("shopwearCart");
    let carItem = document.getElementById("cart-item");
    // console.log(cookie)
    if (cookie === undefined || cookie === "") {
        return
    } else {
        let item = cookie.split("&").filter(Boolean); //去掉split("&")後留下的空string ""
        let c = 0;
        let table = document.getElementById("cart-table");
        for (i of item) {
            // console.log(i)
            combo = i.replace(/[[\]]/g, '').replace(/['"]+/g, "").split(",")
            let id = combo[0];
            let name = combo[1];
            let color = combo[2];
            let size = combo[3];
            let price = combo[4];
            let qty = combo[5];
            let pic = combo[6];
            c++;

            //顯示購物清單
            if (window.location.pathname === "/cart" || window.location.pathname === "/checkout") {
                let tableRow = table.insertRow(c);
                tableRow.id = "tr" + c;
                let cell0 = tableRow.insertCell(0); //pic
                let photo = document.createElement("img");
                photo.src = pic
                let cell1 = tableRow.insertCell(1); //product
                let cell2 = tableRow.insertCell(2); //price
                let cell3 = tableRow.insertCell(3); //qty
                let cell4 = tableRow.insertCell(4); //amount
                cell4.id = "piece-amount";
                let cell5 = tableRow.insertCell(5); //cancel
                let cancelBtn = document.createElement("button"); //取消購物車 Btn
                let btnImg = document.createElement("img");
                cancelBtn.id = "cancel-cart";
                // cancelBtn.innerText = "取消"
                btnImg.src = "../static/photo/cross2.png";
                cancelBtn.appendChild(btnImg);
                let trId = "tr" + c;
                let itemCookie = i + "&";

                //取消購物車 功能
                cancelBtn.addEventListener("click", () => {
                    document.getElementById(trId).remove();
                    //重設Cookie
                    document.cookie = "shopwearCart=" + getCookie("shopwearCart").replace(itemCookie, "") + "; max-age=604800; domain=.dimalife.com; path=/";
                    //重設購物車圖示
                    carItem.innerText -= 1;
                    if (parseInt(carItem.innerText) === 0) {
                        carItem.style.display = "none";
                    }
                    //重新計算商品總計
                    let sum = 0;
                    for (i of document.querySelectorAll('#piece-amount')) {
                        let priceString = i.textContent.split(" ")[1];
                        sum += parseInt(priceString);
                    }
                    let fee = 0;
                    document.getElementById("cart-fee").textContent = "NT$ " + fee
                    document.getElementById("cart-sum").textContent = "NT$ " + sum;
                    document.getElementById("cart-total").textContent = "NT$ " + (sum + fee);
                    // 購物車歸 0 時
                    if ((sum + fee) === 0) {
                        document.getElementById("confirm-cart").style.display = "none";
                        document.getElementById("cart").style.display = "none";
                        document.getElementById("no-item").style.display = "block";
                    }

                })
                cell0.appendChild(photo);
                cell1.innerHTML = name + " / " + color + " / " + size;
                cell2.innerHTML = "NT$ " + price;
                cell3.innerHTML = qty;
                cell4.innerHTML = "NT$ " + (price * qty);
                cell5.appendChild(cancelBtn);
            }
        }
        let sum = 0;
        if (window.location.pathname === "/cart" || window.location.pathname === "/checkout") {
            for (i of document.querySelectorAll('#piece-amount')) {
                let priceString = i.textContent.split(" ")[1];
                sum += parseInt(priceString);
            }
            let fee = 0;
            document.getElementById("cart-fee").textContent = "NT$ " + fee
            document.getElementById("cart-sum").textContent = "NT$ " + sum;
            document.getElementById("cart-total").textContent = "NT$ " + (sum + fee);
            document.getElementById("confirm-cart").style.display = "block";
        }
        if (c === 0) {
            carItem.style.display = "none";
        } else {
            carItem.style.display = "block"
            carItem.textContent = c;
        }
    }

}



// member
// 檢查會員登入狀況
const loggedIn = () => {
    // console.log("/api/user")
    fetch("/api/user", {
            method: "GET",
            headers: headers
        })
        .then((response) => {
            return response.json();
        })
        .then((result) => {
            if (result["data"]) {
                console.log("LOGIN OK");
                console.log(result["data"]["id"]);
                document.getElementById("dorpdown-mywear").value = "https://dimalife.com/mywear/" + result["data"]["id"];
                document.getElementById("nav-item2-a").style.display = "none";
                document.getElementById("mem-dropdown").style.display = "block";

                if (window.location.pathname.startsWith("/mywear")) {
                    if (window.location.pathname.split("/")[2] === String(result["data"]["id"])) {
                        document.getElementById("show-submit-window").style.display = "block";
                    }
                }

                if (window.location.pathname === "/login") {
                    window.location = "/";
                }
                if (window.location.pathname.split("/")[1] === "mywear" && parseInt(window.location.pathname.split("/")[2]) === result["data"]["id"]) {
                    // console.log("KKKKK")
                    document.getElementById("photo-sticker").addEventListener("click", () => { switchUploadSticker("on") });
                    document.getElementById("show-submit-window").style.display = "block";
                }

            } else {
                console.log("not login");
                // document.getElementById("nav-item1-a").addEventListener("click", signinWindow);
                if (window.location.pathname === "/member" || window.location.pathname === "/checkout" || window.location.pathname === "/password") {
                    location.href = "/";
                }
                if (window.location.pathname.split('/')[1] === "wear") {
                    document.getElementById("like-backdrop").style.display = "block";
                }
            }
        })
}


// 會員登出功能 DELETE
const logout = () => {
    fetch("/api/user", {
            method: "DELETE",
            headers: headers
        })
        .then((response) => {
            return response.json();
        })
        .then((result) => {
            if (result["ok"]) {
                // loginButton.removeEventListener("click", logout);
                // loginButton.addEventListener("click", signinWindow);
                // document.getElementById("nav-item1-a").removeAttribute("href"); // 移除預定行程按鈕連結
                // document.getElementById("nav-item2").removeAttribute("href");
                // document.getElementById("nav-item1-a").addEventListener("click", signinWindow);
                window.location.reload();
            }
            console.log("logged out!")
        })
}


// 切換上傳大頭貼按鈕
const switchUploadSticker = (x) => {
    if (x === "on") {
        document.getElementById("m-c-upload").style.display = "block";
        document.getElementById("m-c-cancel").style.display = "block";
        document.getElementsByClassName("edit-profile")[0].style.display = "inline-block";
        document.getElementsByClassName("save-profile")[0].style.display = "none";
    }
    if (x === "off") {
        document.getElementById("m-c-upload").style.display = "none";
        document.getElementById("m-c-cancel").style.display = "none";
        document.getElementsByClassName("media-overlay")[0].style.display = "none";
        document.getElementById("indicator").style.display = "none";
        document.getElementById("photo-sticker").src = stickerSrc;
        document.getElementById('c-sticker').style.display = "none";
    }
}