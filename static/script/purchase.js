//購物車歸 0 
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




// tappay金流
async function sendOrder(prime) {
    let tappayRequestBody = {
        "prime": prime,
        "name": document.getElementById("receiver-name").value,
        "phone": document.getElementById("receiver-number").value,
        "order": {
            "amount": parseInt(document.getElementById("cart-total").textContent.split(" ")[1]),
            "items": [],
            "address": document.getElementById("receiver-address").value
        }
    }
    let cookie = getCookie("shopwearCart");
    let item = cookie.split("&").filter(Boolean); //去掉split("&")後留下的空string ""
    for (i of item) {
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