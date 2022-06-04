let headers = {
    "Access-Control-Allow-Origin": "*",
    "Content-type": "application/json"
};

// 首頁
const showProducts = async(page = 0, category = "", subcategory = "") => {
    let apiAddress = "/api/products?page=" + String(page) + "&category=" + category + "&subcategory=" + subcategory;
    let res = await fetch(apiAddress);
    let data = await res.json();
    document.getElementById("catalogue").innerHTML = "";

    for (i of data["data"]) {
        let box = document.createElement("a");
        let spinner = document.createElement("div");
        let img = document.createElement("img");
        let name = document.createElement("div");
        let price = document.createElement("div");
        box.id = "box" + i["id"];
        box.href = "/product/" + i["id"];
        spinner.id = "spinner";
        img.src = "http://d1pxx4pixmike8.cloudfront.net/shopwear/" + i["photo"];
        name.textContent = i["product_name"];
        name.id = "product-name";
        price.textContent = "NT$ " + i["price"];
        price.id = "price";
        img.onload = () => {
            img.style.display = "block";
            spinner.style.display = "none";
        }
        box.appendChild(spinner);
        box.appendChild(img);
        box.appendChild(name);
        box.appendChild(price);
        document.getElementById("catalogue").appendChild(box);
    }

    let pageList = document.createElement("ul");
    pageList.id = "catalogue-page";
    let pageLi = document.createElement("li");
    pageLi.textContent = "Page: ";
    pageLi.style.display = "none";
    pageList.appendChild(pageLi);
    document.getElementById("page-container").innerHTML = "";
    //頁數 p
    let p = 1
    for (let i in [...Array(data["total_page"]).keys()]) {
        let li = document.createElement("li");
        li.textContent = p;
        li.id = "p" + p;
        li.onclick = () => {
            showProducts(i, category, subcategory);
            li.style.border = "1px solid #d8d8d8";
        }
        pageList.appendChild(li);
        p++;
    }
    document.getElementById("page-container").appendChild(pageList);
    let liId = "p" + (parseInt(page) + 1);
    document.getElementById(liId).style.border = "1px solid #d8d8d8";
}


// product頁面

const inputAttributes = {
    name: "switch-button",
    type: "radio",
    class: "data-switch-input-btn"
}

function addAttributes(element, attributes) {
    Object.keys(attributes).forEach(attr => {
        element.setAttribute(attr, attributes[attr]);
    });
}

//產品資料
const showProductDetail = async() => {
    let apiAddress = "/api/product/" + window.location.pathname.split("/")[2];
    let res = await fetch(apiAddress);
    let data = await res.json();
    document.getElementById("product_id").textContent = data["id"];
    document.getElementById("product_name").textContent = data["product_name"];
    document.getElementById("product_price").textContent = "NT$ " + data["price"];
    document.getElementById("description").textContent = data["description"];
    document.getElementById("content").textContent = data["content"];
    document.getElementById("size-suggest").textContent = data["size_suggest"];
    let colorStock = document.createElement("div");
    colorStock.className = "color-stock"
    let colBox = document.createElement("div");
    colBox.className = "col-box";
    for (i in data["stock"]) {
        let colLabl = document.createElement("label");
        colLabl.className = "labl";
        let colInput = document.createElement("input");
        colInput.setAttribute("type", "radio");
        colInput.setAttribute("name", "color");
        colInput.value = i;
        let col = document.createElement("div");
        col.textContent = i;
        colLabl.appendChild(colInput);
        colLabl.appendChild(col);
        colBox.appendChild(colLabl);
    }

    let sizeBox = document.createElement("div");
    sizeBox.className = "size-box";
    for (j of Object.values(data["stock"])[0]) {
        let labl = document.createElement("label");
        labl.className = "labl";
        let input = document.createElement("input");
        input.setAttribute("type", "radio");
        input.setAttribute("name", "size");
        input.value = j;
        let size = document.createElement("div");
        size.textContent = j;
        labl.appendChild(input);
        labl.appendChild(size);
        sizeBox.appendChild(labl);
    }
    colorStock.appendChild(colBox);
    colorStock.appendChild(sizeBox);
    document.getElementById("product-desc").append(colorStock);
    let qtyLabl = document.createElement("label");
    qtyLabl.for = "prod-qty";
    qtyLabl.textContent = "數量 ";
    let qty = document.createElement("select");
    qty.id = "prod-qty";
    for (let i = 1; i < 6; i++) {
        let opt = document.createElement("option");
        opt.textContent = i;
        opt.value = i;
        qty.appendChild(opt);
    }
    document.getElementById("product-desc").append(qtyLabl);
    document.getElementById("product-desc").append(qty);

    let btn = document.createElement("button");
    btn.id = "cart-btn";
    btn.textContent = "加入購物車";
    btn.onclick = () => {
        addCart();
        showCart();
    };
    document.getElementById("product-desc").append(btn);
    window.document.title = data["product_name"];
    let proPhotos = document.getElementById("product-photos");
    let imgList = data["photo"];
    for (let i = 0; i < imgList.length; i++) {
        let input = document.createElement("input");
        let li = document.createElement("li");
        let img = document.createElement("img");
        // let spinner = document.createElement("div");
        addAttributes(input, inputAttributes);
        li.setAttribute("class", "slide");
        img.src = "https://vaapadshopwear.s3.us-west-2.amazonaws.com/shopwear/" + imgList[i];
        // spinner.id = "spinner";
        // img.onload = () => {
        //     img.style.display = "block";
        //     spinner.style.display = "none";
        // }
        document.getElementsByClassName("data-switch-input")[0].appendChild(input);
        li.appendChild(img);
        proPhotos.append(img.cloneNode(true));
        // li.appendChild(spinner);
        document.getElementById("slide-list").appendChild(li);
        // document.getElementById("slide-list").appendChild(spinner);
        // img.onload = () => {
        //     img.style.display = "block";
        //     spinner.style.display = "none";
        // }
    }
    if (imgList.length === 1) {
        document.getElementsByClassName("data-switch-input")[0].style.display = "none";
        document.getElementsByClassName("carousel-button prev")[0].style.display = "none";
        document.getElementsByClassName("carousel-button next")[0].style.display = "none";
    }
    document.getElementsByClassName("data-switch-input-btn")[0].checked = true;
    document.getElementsByClassName("slide")[0].dataset.active = true;
    inputBtn = document.querySelectorAll(".data-switch-input-btn")
        // console.log(inputBtn = document.querySelectorAll(".data-switch-input-btn"))

}

//A Function to Get a Cookie
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


//加入購物車cookie
const addCart = () => {
    let color = document.querySelector('input[name="color"]:checked').value;
    let size = document.querySelector('input[name="size"]:checked').value;
    let id = document.getElementById('product_id').textContent;
    let name = document.getElementById('product_name').textContent;
    let price = document.getElementById('product_price').textContent.split(" ")[1]
    let qty = document.getElementById("prod-qty").value;
    let pic = document.querySelector(".slide>img").src;
    let arr = JSON.stringify([id, name, color, size, price, qty, pic]);
    // console.log("shopwearCart:" + arr + "=" + arr + "; path=/")
    if (getCookie("shopwearCart") === undefined) {
        document.cookie = "shopwearCart=" + arr + "&" + "; max-age=604800; path=/";
    } else {
        currentItem = getCookie("shopwearCart");
        currentItem = currentItem + arr + "&";
        document.cookie = "shopwearCart=" + currentItem + "; max-age=604800; path=/";
    }

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
            // console.log(combo);
            c++;

            //顯示購物清單
            if (window.location.pathname === "/cart" || window.location.pathname === "/checkout") {
                // console.log("CART")
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
                // let newCcookie = cookie.replace(itemCookie, "");
                //取消購物車 功能
                cancelBtn.addEventListener("click", () => {
                    document.getElementById(trId).remove();
                    // console.log(itemCookie)
                    // console.log("shopwearCart=" + getCookie("shopwearCart").replace(itemCookie, "") + "; path=/")
                    //重設Cookie
                    document.cookie = "shopwearCart=" + getCookie("shopwearCart").replace(itemCookie, "") + "; max-age=604800; path=/";
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


//購物車歸 0 時
const keepBuy = () => {
    if (document.getElementById("confirm-cart").style.display !== "block") {
        document.getElementById("cart").style.display = "none";
        document.getElementById("no-item").style.display = "block";
    }
}

//前往結帳
const goToCheckout = () => {
    if (getCookie("shopwear_user") === undefined) {
        window.location = "/login";
    } else {
        window.location = "/checkout";
    }
}

// 查歷史訂單
const showOrders = async() => {
    let res = await fetch("/api/orders");
    let data = await res.json();
    if (data["data"].length !== 0) {
        for (let i = data["data"].length - 1; i >= 0; i--) {
            let orderInfo = document.createElement("div");
            let orderTable = document.createElement("table");
            let btn = document.createElement("button");
            let img = document.createElement("img");
            let order_no = data["data"][i]["order_no"];
            btn.setAttribute("data-id", data["data"][i]["id"]);
            btn.id = "order-detail-btn";
            btn.textContent = "詳細訂單資料";
            img.id = "plus-btn-img"
            img.src = "../static/photo/plus-1.jpg";

            let tableHeader = orderTable.insertRow(0);
            tableHeader.id = "table-header";
            let th0 = tableHeader.insertCell(0);
            let th1 = tableHeader.insertCell(1);
            let th2 = tableHeader.insertCell(2);
            let th3 = tableHeader.insertCell(3);
            th0.style.width = "38%";
            th1.style.width = "23%";
            th2.style.width = "20%";
            th3.style.width = "19%";
            th0.innerHTML = "訂單編號";
            th1.innerHTML = "下訂日期";
            th2.innerHTML = "金額";
            th3.innerHTML = "付款狀態"
            let tableRow = orderTable.insertRow(1);
            let cell0 = tableRow.insertCell(0);
            let cell1 = tableRow.insertCell(1);
            let cell2 = tableRow.insertCell(2);
            let cell3 = tableRow.insertCell(3);
            cell0.innerHTML = order_no;
            cell1.innerHTML = data["data"][i]["date"];
            cell2.innerHTML = "NT$ " + String(data["data"][i]["amount"]) + " 元";
            cell3.innerHTML = data["data"][i]["payment"] === "paid" ? "已付款" : "未付款";

            orderInfo.id = "order-info";
            let elem = [orderTable, img, btn]
            elem.forEach(div => { orderInfo.appendChild(div); });
            document.getElementById("orders").appendChild(orderInfo);

            let hiddenDiv = document.createElement("div");
            hiddenDiv.id = "hidden-detail";
            hiddenDiv.style.height = "0";
            hiddenDiv.classList.add("close");
            hiddenDiv.style.overflowY = "auto";
            document.getElementById("orders").appendChild(hiddenDiv);

            btn.onclick = () => {
                if (hiddenDiv.classList.contains("close")) {
                    hiddenDiv.classList.remove("close");
                    hiddenDiv.style.height = "200px";
                    img.src = "../static/photo/minus-1.jpg"
                    checkOrderDetails(order_no, hiddenDiv);
                } else {
                    hiddenDiv.classList.add("close");
                    hiddenDiv.style.height = "0";
                    img.src = "../static/photo/plus-1.jpg";
                    // hiddenDiv.innerHTML = "";
                }
            }
            img.onclick = () => {
                if (hiddenDiv.classList.contains("close")) {
                    hiddenDiv.classList.remove("close");
                    hiddenDiv.style.height = "200px";
                    img.src = "../static/photo/minus-1.jpg"
                } else {
                    hiddenDiv.classList.add("close");
                    hiddenDiv.style.height = "0";
                    img.src = "../static/photo/plus-1.jpg";
                    // hiddenDiv.innerHTML = "";
                }
            }
        }
    } else {
        let orderResult = document.createElement("div");
        orderResult.textContent = "目前沒有訂單資料";
        document.getElementById("orders").appendChild(orderResult);
    }
}

// order_details
const checkOrderDetails = async(order_no, hiddenDiv) => {
    if (hiddenDiv.innerHTML !== "") { return };
    let res = await fetch("/api/order_details/" + order_no);
    let data = await res.json();
    for (i in data["data"]) {
        console.log(data["data"])
        console.log(data["data"][i]["product_name"])
        let item = document.createElement("div");
        let img = document.createElement("img");
        let product_name = document.createElement("span");
        let color = document.createElement("span");
        let size = document.createElement("span");
        let price = document.createElement("span");
        let qty = document.createElement("span");
        img.src = "http://d1pxx4pixmike8.cloudfront.net/shopwear/" + data["data"][i]["product_name"] + "/" + data["data"][i]["product_name"] + "-1.jpg";
        product_name.innerHTML = data["data"][i]["product_name"];
        color.innerHTML = data["data"][i]["color"];
        size.innerHTML = data["data"][i]["size"];
        price.innerHTML = "NT$ " + data["data"][i]["price"];
        qty.innerHTML = "數量: " + data["data"][i]["qty"];
        let divs = [img, product_name, color, size, price, qty];
        divs.forEach(div => { item.appendChild(div); });
        hiddenDiv.appendChild(item);
    }

}

// 左右按鈕輪播功能
const buttons = document.querySelectorAll("[data-carousel-button]")
buttons.forEach(button => {
    button.addEventListener("click", () => {
        let offset = button.dataset.carouselButton === "next" ? 1 : -1
            // 條件 (三元) 運算子  // dataset.carouselButton等於data-carousel-button
        let slides = document.querySelector("[data-slides]")
            // const slides = button.closest("[data-carousel]").querySelector("[data-slides]")
        let activeSlide = document.querySelector("[data-active]")
        let newIndex = [...slides.children].indexOf(activeSlide) + offset
        if (newIndex < 0) newIndex = slides.children.length - 1
        if (newIndex >= slides.children.length) newIndex = 0
        delete activeSlide.dataset.active
        slides.children[newIndex].dataset.active = true

        let inputBtn = document.querySelectorAll(".data-switch-input input")
        let checkedInput = document.querySelector("[checked=checked]")
        inputBtn[newIndex].checked = true
            // checkedInput.checked = false
    })
})

// 下方園點輪播功能
window.onclick = e => {
    console.log(e.target); // to get the element
    let index = [...inputBtn].indexOf(document.querySelector([".data-switch-input-btn:checked"]))
    let activeSlide = document.querySelector("[data-active]")
    let slides = document.querySelector("[data-slides]")
    delete activeSlide.dataset.active
    slides.children[index].dataset.active = true
}


// member
// 檢查會員登入狀況
const loggedIn = () => {
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
                    window.history.back();
                }
            } else {
                console.log("not login");
                // document.getElementById("nav-item1-a").addEventListener("click", signinWindow);
                if (window.location.pathname === "/member" || window.location.pathname === "/checkout" || window.location.pathname === "/password") {
                    location.href = "/";
                }
            }
        })
}

// 會員登入功能 PATCH
const signin = () => {
    let email = document.getElementById("signin-email").value;
    let password = document.getElementById("signin-password").value;
    // 串接API
    let body = {
        "email": email,
        "password": password
    };
    fetch("/api/user", {
            method: "PATCH",
            headers: headers,
            body: JSON.stringify(body)
        })
        .then((response) => {
            return response.json();
        })
        .then((result) => {
            if (result["ok"]) {
                // window.history.go(-1);
                window.location = document.referrer;
            } else {
                console.log(result["message"])
                document.getElementById("signin-message").innerHTML = "登入失敗，帳號或密碼錯誤或其他原因";
            }
        })
}

// 註冊功能 POST
const signup = () => {
    let name = document.getElementById("signup-name").value;
    let email = document.getElementById("signup-email").value;
    let password = document.getElementById("signup-password").value;
    let number = document.getElementById("signup-number").value;
    let address = document.getElementById("signup-address").value;
    // 表單驗證
    let nameRegex = /^([\u4e00-\u9fa5]{2,20}|[a-zA-Z.\s]{2,20})$/;
    let emailRegex = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,8})$/;
    // let pwRegex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[~!@#$%^&*()_ `\-={}:";'<>?,.\/]).{3,18}$/;
    if (name === "" | email === "" | password === "") {
        document.getElementById("signup-message").innerHTML = "欄位不可為空，請輸入資料!";
        return;
    }
    if (!nameRegex.test(name)) {
        document.getElementById("signup-message").innerHTML = "請輸入正確姓名格式";
        return;
    }
    if (!emailRegex.test(email)) {
        document.getElementById("signup-message").innerHTML = "請輸入正確信箱格式";
        return;
    }
    // if (!pwRegex.test(password)) {
    //     document.getElementById("signup-message").innerHTML = "密碼必須為3-18位字母、數字、特殊符號";
    //     return;
    // }
    // 串接API，回復註冊狀況
    let body = {
        "name": name,
        "email": email,
        "password": password,
        "number": number,
        "address": address
    };
    fetch("/api/user", {
            method: "POST",
            headers: headers,
            body: JSON.stringify(body)
        })
        .then((response) => {
            return response.json();
        })
        .then((result) => {
            if (result["ok"]) {
                document.getElementById("signup-message").innerHTML = "註冊成功";
                location.href = "/login";
            } else {
                console.log(result["message"])
                document.getElementById("signup-message").innerHTML = "註冊失敗，重複的 Email 或其他原因";
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

//顯示會員資料 GET
const showMemberInfo = async() => {
    let res = await fetch("/api/user", { method: "GET", headers: headers });
    let data = await res.json();
    if (data["data"]) {
        document.getElementById("mem-name").value = data['data']["name"];
        document.getElementById("mem-email").value = data['data']["email"];
        if (data['data']['nickname'] !== "") { document.getElementById("mem-nickname").value = data['data']['nickname'] }
        if (data['data']['gender'] !== "") { document.getElementById("gender").value = data['data']['gender'] }
        if (data['data']["number"] !== "") { document.getElementById("mem-number").value = data['data']["number"] }
        if (data['data']["address"] !== "") { document.getElementById("mem-add").value = data['data']["address"] }
        return
    }
}

//更新會員資料 PATCH
const updateMember = async() => {
    let nickname = document.getElementById("mem-nickname").value;
    let gender = document.getElementById("gender").value
    let number = document.getElementById("mem-number").value;
    let address = document.getElementById("mem-add").value;
    let body = {
        "nickname": nickname,
        "gender": gender,
        "number": number,
        "address": address
    }
    let res = await fetch("/api/member", { method: "PATCH", headers: headers, body: JSON.stringify(body) });
    let data = await res.json();
    if (data["ok"]) {
        document.getElementById('update-member-msg').style.display = "flex";
        setTimeout(function() {
            document.getElementById('update-member-msg').style.display = "none";
        }, 1500)
    }
}


//更改會員密碼 PATCH
const changePw = async() => {
    let oldPw = document.getElementById("cur-pw").value;
    let newPw = document.getElementById("new-pw").value;
    let confirmPw = document.getElementById("confirm-pw").value;
    if (oldPw === "" || newPw === "" || confirmPw === "") {
        document.getElementById("noUpdate-pw-msg").style.display = "flex";
        document.getElementById("error-pw-msg").style.color = "red";
        document.getElementById("error-pw-msg").innerHTML = "欄位不可為空，請輸入資料!";
        setTimeout(function() {
            document.getElementById('noUpdate-pw-msg').style.display = "none";
        }, 2000)
        return;
    }
    let body = {
        "old_pw": oldPw,
        "new_pw": newPw,
        "confirm_pw": confirmPw
    }
    let res = await fetch("/api/password", {
        method: "PATCH",
        headers: headers,
        body: JSON.stringify(body)
    });
    let data = await res.json();
    if (res.status === 400) {
        document.getElementById("noUpdate-pw-msg").style.display = "flex";
        document.getElementById("error-pw-msg").style.color = "red";
        document.getElementById("error-pw-msg").innerHTML = data["message"];
        setTimeout(function() {
            document.getElementById('noUpdate-pw-msg').style.display = "none";
        }, 2000)
    }
    if (data["ok"]) {
        document.getElementById("okUpdate-pw-msg").style.display = "flex";
        document.getElementById("ok-pw-msg").innerHTML = "更新密碼成功";
        setTimeout(function() {
            document.getElementById('okUpdate-pw-msg').style.display = "none";
        }, 2000)
    }

}



// tappay
async function send_order(prime) {
    let tappayRequestBody = {
        "prime": prime,
        "order": {
            "amount": parseInt(document.getElementById("cart-total").textContent.split(" ")[1]),
            "items": [],
            "address": document.getElementById("receiver-address").value
        }
    }
    let cookie = getCookie("shopwearCart");
    let item = cookie.split("&").filter(Boolean); //去掉split("&")後留下的空string ""
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
        let items = {
            "prod_id": id,
            "prod_name": name,
            "prod_color": color,
            "prod_size": size,
            "prod_price": price,
            "prod_qty": qty,
            "prod_pic": pic
        };
        tappayRequestBody.order.items.push(items);

    }
    try {
        let response = await fetch("/api/orders", {
            method: "POST",
            headers: {
                "Content-type": "application/json"
            },
            body: JSON.stringify(tappayRequestBody)
        });
        let data = await response.json();
        // order_no = data["data"]["number"];
        // console.log(order_no);
        if (data['error']) {
            console.log("tappay not OK");
            document.getElementById("backdrop-wrapper").style.display = "block";
        } else {
            console.log("tappay OK");
            orderNo = data["data"]["number"]
            console.log("/thankyou?order=" + orderNo)
            location.href = "/thankyou?order=" + orderNo;
            document.cookie = "shopwearCart=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        }
    } catch (error) {
        console.log(error);
    }
}



// wear.html自動載入後續頁面的功能

// page
let page = 0;
// 觸發條件後的回呼函式
let showWear = (entry) => {
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

                            if (data["photo_sticker"] === null) { mem_photo.style.display = "none"; }
                            photoBox.id = "pic" + photoCount;
                            aTag.href = "/wear/" + id;
                            wrapper.id = "wear-member-name";
                            mem_photo.src = "http://d1pxx4pixmike8.cloudfront.net/mywear/photo_sticker/" + photo_sticker;
                            name.innerHTML = member_nickname !== "" ? member_nickname : member_name;
                            mem_photo.id = "wear-photo-sticker";
                            img.src = "http://d1pxx4pixmike8.cloudfront.net/mywear/" + photo;
                            nameBox.appendChild(mem_photo);
                            nameBox.appendChild(name);
                            wrapper.appendChild(nameBox)
                            aTag.appendChild(wrapper);
                            aTag.appendChild(img);
                            photoBox.appendChild(aTag);
                            photoWrapper.appendChild(photoBox);
                            photoCount++;
                        }

                        document.getElementById("wear-pics").appendChild(photoWrapper)
                    }
                })
                // 沒有下一頁時停止observe
        } else {
            observer.unobserve(target);
            console.log("unobserved");
        };
    }
}

// 觸發條件
let options = { rootMargin: '20px', threshold: 0, };
// 建立 IntersectionObserver物件
let observer = new IntersectionObserver(showWear, options);
const target = document.getElementById("end"); // observer的target
if (window.location.pathname === "/wear") {
    observer.observe(target); // 開啟觀察目標
}


// mywear.html自動載入後續頁面的功能

//mywear上傳大頭貼
const submitPhotoSticker = async() => {
    let formData = new FormData();
    let file = document.getElementById('media-input');
    formData.append("pic", file.files[0]);
    console.log(1)
    let res = await fetch("/api/mywear/photo_sticker", {
        method: 'POST',
        body: formData
    })
    let data = await res.json()
    console.log(2)
        // let text = document.getElementById("text-message").value;
        // let content = document.getElementById("content");
        // let textDiv = document.createElement("div");
    let photoSticker = document.getElementById("photo-sticker");
    // let hr = document.createElement("hr");
    // textDiv.textContent = text;
    if (data["error"]) {
        console.log(data["message"]);
    } else {
        photoSticker.src = "http://d7h07qlpoj67x.cloudfront.net/mywear/photo_sticker/" + data["pic_src"];
    }
}

// mywear.html PO文視窗
const showSubmitWindow = () => {
    document.getElementById('submit-window-block').style.display = 'flex';
    document.getElementById('upload-container-1').style.display = 'flex';
    document.getElementById("wear-upload-msg").innerHTML = "";
    document.getElementById("selected-item-1").innerHTML = "";
    document.getElementById("selected-item-2").innerHTML = "";
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
    document.getElementById('wear-upload-spinner').style.display = "none";
    document.getElementById('submit-window-block').style.display = 'none';
    document.getElementById("preview-container").style.zIndex = 0;
    document.getElementById("file-ip-1-preview").removeAttribute('src');
    document.getElementById("file-ip-1-preview").style.display = 'none';
    document.getElementById("preview-cncl-btn").style.display = 'none';
    document.getElementById("upload-container-1").style.display = 'flex';
    document.getElementById("upload-container-2").style.display = 'none';
    document.getElementById("upload-container-3").style.display = 'none';
    switchBtnNext("");
    switchBtnPrev();
    nextStep('upload-container-2', 'upload-container-1');
}
const submitWindow = () => {

    }
    // 拖曳上傳圖片功能
    // function uploadFiles() {
    //     var files = document.getElementById('file-upload').files;
    //     if (files.length == 0) {
    //         alert("Please first choose or drop any file(s)...");
    //         return;
    //     }
    //     var filenames = "";
    //     for (var i = 0; i < files.length; i++) {
    //         filenames += files[i].name + "\n";
    //     }
    //     alert("Selected file(s) :\n____________________\n" + filenames);
    // }

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
    document.getElementById("wear-upload-spinner").style.display = 'none';
    document.getElementById("selected-item-1").innerHTML = "";
    document.getElementById("selected-item-2").innerHTML = "";
}

// selected item
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
            // box.href = "/product/" + i["id"];
        spinner.id = "spinner";
        img.src = "http://d1pxx4pixmike8.cloudfront.net/shopwear/" + i["photo"];
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
    document.getElementById("wear-upload-spinner").style.display = 'block';
    let formData = new FormData();
    let file = document.getElementById("file-upload");
    let itemIds = [];
    for (i of document.getElementById('selected-item-1').children) {
        itemIds.push(i.children[1].id)
    }
    formData.append("pic", file.files[0]);
    formData.append("text", itemIds);
    formData.append("caption", "");
    let res = await fetch("/api/mywear/upload", {
        method: "POST",
        body: formData
    });
    let data = await res.json();
    if (data["ok"]) {
        closeSubmitWindow();
        window.location.reload();
    }
    console.log(data["file_name"]);
}

//WEAR單頁資料

const showWearDetail = async() => {
    let apiAddress = "/api/wear/" + window.location.pathname.split("/")[2];
    let res = await fetch(apiAddress);
    let data = await res.json();
    document.getElementById("wear_id").textContent = data["id"];
    document.getElementById("member_id").textContent = data["member_id"];
    document.getElementById("member_nickname").href = "/mywear/" + data["member_id"];
    document.getElementById("member_nickname").textContent = data["member_nickname"] !== "" ? data["member_nickname"] : data["member_name"];
    // document.getElementById("product_id").textContent = data["product_id"];
    document.getElementById("caption").textContent = data["caption"];

    // window.document.title = data["product_name"];
    let imgList = data["photo"];
    // console.log(imgList)
    for (let i = 0; i < imgList.length; i++) {
        let input = document.createElement("input");
        let li = document.createElement("li");
        let img = document.createElement("img");
        // let spinner = document.createElement("div");
        addAttributes(input, inputAttributes);
        li.setAttribute("class", "slide");
        img.src = "http://d1pxx4pixmike8.cloudfront.net/mywear/" + imgList[i];
        // spinner.id = "spinner";
        // img.onload = () => {
        //     img.style.display = "block";
        //     spinner.style.display = "none";
        // }
        document.getElementsByClassName("data-switch-input")[0].appendChild(input);
        li.appendChild(img);
        // li.appendChild(spinner);
        document.getElementById("slide-list").appendChild(li);
    }
    if (imgList.length === 1) {
        document.getElementsByClassName("data-switch-input")[0].style.display = "none";
        document.getElementsByClassName("carousel-button prev")[0].style.display = "none";
        document.getElementsByClassName("carousel-button next")[0].style.display = "none";
    }
    for (j in data["product_photos"]) {
        let box = document.createElement("a");
        let img = document.createElement("img");
        let span = document.createElement("span");
        img.src = "http://d1pxx4pixmike8.cloudfront.net/shopwear/" + data["product_photos"][j];
        span.textContent = data["product_photos"][j].split("/")[0];
        box.href = "/product/" + data["product_id"][j];
        box.appendChild(img);
        box.appendChild(span)
        document.getElementById("wear-products").appendChild(box)
    }

    document.getElementsByClassName("data-switch-input-btn")[0].checked = true;
    document.getElementsByClassName("slide")[0].dataset.active = true;
    inputBtn = document.querySelectorAll(".data-switch-input-btn")
        // console.log(inputBtn = document.querySelectorAll(".data-switch-input-btn"))
    showOtherWears(data["member_id"]);
}

const showOtherWears = async(memberId) => {
    let otherWears = document.getElementById("other-wears");
    apiAdress = "/api/mywear" + "?member=" + memberId + "&page=0";
    let res = await fetch(apiAdress);
    let result = await res.json();
    for (i in result["data"]) {
        data = result["data"][i]
        let id = data["id"];
        let photo = data["photo"];
        // let member = data["member_id"];
        // let caption = data["caption"];

        let photoBox = document.createElement("div");
        let aTag = document.createElement("a");
        let img = document.createElement("img");
        aTag.href = "/wear/" + id;
        img.src = "http://d1pxx4pixmike8.cloudfront.net/mywear/" + memberId + "/" + photo;
        aTag.appendChild(img);
        photoBox.appendChild(aTag);
        otherWears.appendChild(photoBox);
    }
}