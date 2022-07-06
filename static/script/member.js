// 查歷史訂單
const showOrders = async() => {
    let res = await fetch("/api/orders");
    let data = await res.json();
    if (data["error"]) {
        window.location = "/login";
    }
    // 建立訂單基本資料<table>
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
            img.src = "../static/photo/plus-1.png";

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

            //展開查詢訂單詳細資料功能
            btn.onclick = () => {
                if (hiddenDiv.classList.contains("close")) {
                    hiddenDiv.classList.remove("close");
                    hiddenDiv.style.height = "200px";
                    img.src = "../static/photo/minus-1.png"
                    checkOrderDetails(order_no, hiddenDiv);
                } else {
                    hiddenDiv.classList.add("close");
                    hiddenDiv.style.height = "0";
                    img.src = "../static/photo/plus-1.png";
                    // hiddenDiv.innerHTML = "";
                }
            }
            img.onclick = () => {
                if (hiddenDiv.classList.contains("close")) {
                    hiddenDiv.classList.remove("close");
                    hiddenDiv.style.height = "200px";
                    img.src = "../static/photo/minus-1.png"
                } else {
                    hiddenDiv.classList.add("close");
                    hiddenDiv.style.height = "0";
                    img.src = "../static/photo/plus-1.png";
                    // hiddenDiv.innerHTML = "";
                }
            }
        }
    } else {
        let orderResult = document.createElement("div");
        orderResult.textContent = "目前沒有訂單資料";
        orderResult.style.color = "#2a22d6";
        orderResult.style.fontWeight = "bold";
        document.getElementById("orders").appendChild(orderResult);
    }
}

// 詳細訂單資料
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
        img.src = "https://d1pxx4pixmike8.cloudfront.net/shopwear/" + data["data"][i]["product_name"] + "/" + data["data"][i]["product_name"] + "-1.jpg";
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



// member

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
                    if (document.referrer === '') {
                        window.location = '/';
                    } else { window.location = document.referrer; }

                } else {
                    console.log(result["message"])
                    document.getElementById("signin-message").innerHTML = "登入失敗，帳號或密碼錯誤或其他原因";
                }
            })
    }
    // 訪客登入
const guestSignin = () => {
    // 串接API
    let body = {
        "email": "guest@mail.com",
        "password": "pass"
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
                if (document.referrer === '') {
                    window.location = '/';
                } else { window.location = document.referrer; }

            } else {
                console.log(result["message"])
                document.getElementById("signin-message").innerHTML = "登入失敗，帳號或密碼錯誤或其他原因";
            }
        })
}

// 切換登入/註冊
const showLogin = (a, b) => {
    document.getElementById("signup-block").style.display = a;
    document.getElementById("signin-block").style.display = b;
}

// 註冊功能 POST
const signup = () => {
    let name = document.getElementById("signup-name").value;
    let email = document.getElementById("signup-email").value;
    let password = document.getElementById("signup-password").value;
    let cfmPassword = document.getElementById("confirm-password").value;
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
    // if (!nameRegex.test(name)) {
    //     document.getElementById("signup-message").innerHTML = "請輸入正確姓名格式";
    //     return;
    // }
    if (!emailRegex.test(email)) {
        document.getElementById("signup-message").innerHTML = "請輸入正確信箱格式";
        return;
    }

    if (password !== cfmPassword) {
        document.getElementById("signup-message").innerHTML = "確認密碼不相同";
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
        "cfmPassword": cfmPassword,
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
        }, 2500)
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
        }, 2500)
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
        }, 2500)
    }
    if (data["ok"]) {
        document.getElementById("okUpdate-pw-msg").style.display = "flex";
        document.getElementById("ok-pw-msg").innerHTML = "更新密碼成功";
        setTimeout(function() {
            document.getElementById('okUpdate-pw-msg').style.display = "none";
        }, 2500)
    }

}