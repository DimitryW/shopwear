let headers = {
    "Content-type": "application/json"
};

// 首頁
const showProducts = async(page = 0) => {
    let apiAddress = "api/products?page=" + String(page);
    let res = await fetch(apiAddress);
    let data = await res.json();
    for (i of data["data"]) {
        let box = document.createElement("a");
        let spinner = document.createElement("div");
        let img = document.createElement("img");
        let name = document.createElement("div");
        let price = document.createElement("div");
        box.id = "box" + i["id"];
        box.href = "/product/" + i["id"];
        spinner.id = "spinner";
        img.src = "https://vaapadshopwear.s3.us-west-2.amazonaws.com/shopwear/" + i["photo"];
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
    pageList.appendChild(pageLi);
    for (let i in [...Array(data["total_page"]).keys()]) {
        let li = document.createElement("li");
        li.textContent = i;
        li.onclick = () => {
            let oldPage = document.getElementById("catalogue-page");
            oldPage.remove();
            document.getElementById("catalogue").innerHTML = "";
            showProducts(i);
        }
        pageList.appendChild(li);
    }
    document.getElementById("main-container").appendChild(pageList);
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

const showProductDetail = async() => {
    let apiAddress = "/api/product/" + window.location.pathname.split("/")[2];
    let res = await fetch(apiAddress);
    let data = await res.json();
    document.getElementById("product_id").textContent = data["id"];
    document.getElementById("product_name").textContent = data["product_name"];
    document.getElementById("product_price").textContent = "NT$ " + data["price"];
    document.getElementById("description").textContent = data["description"];
    document.getElementById("content").textContent = data["content"];
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
    for (let i = 1; i < 11; i++) {
        let opt = document.createElement("option");
        opt.textContent = i;
        qty.appendChild(opt);
    }
    document.getElementById("product-desc").append(qtyLabl);
    document.getElementById("product-desc").append(qty);

    let btn = document.createElement("button");
    btn.id = "cart-btn";
    btn.textContent = "加入購物車";
    document.getElementById("product-desc").append(btn);
    window.document.title = data["product_name"];
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
        // li.appendChild(spinner);
        document.getElementById("slide-list").appendChild(li);
    }
    document.getElementsByClassName("data-switch-input-btn")[0].checked = true;
    document.getElementsByClassName("slide")[0].dataset.active = true;
    inputBtn = document.querySelectorAll(".data-switch-input-btn")
        // console.log(inputBtn = document.querySelectorAll(".data-switch-input-btn"))

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

        let inputBtn = document.querySelectorAll("input")
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
                // membername = result["data"]["name"];
                // console.log(membername);
                // loginButton.innerHTML = "登出系統";
                document.getElementById("nav-item2-a").style.display = "none";
                document.getElementById("mem-dropdown").style.display = "block";
                // loginButton.removeEventListener("click", signinWindow);
                // loginButton.addEventListener("click", logout);
                // document.getElementById("nav-item2-a").setAttribute("href", memberSrc + "/member");
                // document.getElementById("nav-item2-a").style.color = "#666666";
                // console.log("already logged in.")
                // document.getElementById("nav-item1").removeEventListener("click", signinWindow);
                // document.getElementById("nav-item1-a").setAttribute("href", memberSrc + "/booking");
                // document.getElementById("nav-item1-a").style.color = "#666666";
                if (window.location.pathname === "/login") {
                    location.href = "/member";
                }
            } else {
                console.log("LOGOUT");
                // document.getElementById("nav-item1-a").addEventListener("click", signinWindow);
                if (window.location.pathname === "/member") {
                    location.href = "/";
                }
            }
        })
}

// 會員登入功能
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
                window.location.reload();
            } else {
                console.log(result["message"])
                document.getElementById("signin-message").innerHTML = "登入失敗，帳號或密碼錯誤或其他原因";
            }
        })
}

// 註冊功能
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

// 會員登出功能
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

const showMemberInfo = async() => {
    let res = await fetch("/api/user", { method: "GET", headers: headers });
    let data = await res.json();
    if (data["data"]) {
        document.getElementById("mem-name").textContent = "姓名 : " + data['data']["name"];
        document.getElementById("mem-email").textContent = "Email : " + data['data']["email"];
        document.getElementById("mem-number").textContent = data['data']["number"] !== null ? "聯絡電話 : " + data['data']["number"] : "聯絡電話 : ";
        document.getElementById("mem-add").textContent = data['data']["address"] !== null ? "地址 : " + data['data']["address"] : "地址 : ";
        return
    }
}