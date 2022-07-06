// Index.html

// 顯示首頁產品
const showProducts = async(page = 0, category = "", subcategory = "") => {
    let apiAddress = "/api/products?page=" + String(page) + "&category=" + category + "&subcategory=" + subcategory;
    let res = await fetch(apiAddress);
    let data = await res.json();
    document.getElementById("catalogue").innerHTML = "";
    for (i of data["data"]) {
        let box = document.createElement("a");
        // let spinner = document.createElement("div");
        let img = document.createElement("img");
        let name = document.createElement("div");
        let price = document.createElement("div");
        box.id = "box" + i["id"];
        box.href = "/product/" + i["id"];
        name.textContent = i["product_name"];
        name.id = "product-name";
        price.textContent = "NT$ " + i["price"];
        price.id = "price";

        img.onload = () => {
            document.getElementById("index-lds").style.display = 'none';
            // let canvas = document.createElement('canvas')
            // let ctx = canvas.getContext('2d')
            // canvas.width = 330;
            // canvas.height = 320;
            // 繪圖
            // ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, 330, 320)
            // box.appendChild(canvas);
        }
        img.src = "https://d1pxx4pixmike8.cloudfront.net/shopwear/" + i["photo"];
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
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
        pageList.appendChild(li);
        p++;
    }
    document.getElementById("page-container").appendChild(pageList);
    let liId = "p" + (parseInt(page) + 1);
    document.getElementById(liId).style.border = "1px solid #d8d8d8";
}




// product.html
// 顯示產品資料
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
    // 基本資料
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
    let colText = document.createElement("span");
    colText.innerHTML = "顏色";
    colBox.appendChild(colText);
    // 顏色尺寸選擇按鈕
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
    let sizeText = document.createElement("span");
    sizeText.innerHTML = "尺寸";
    sizeBox.appendChild(sizeText);
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

    // 加入購物車按鈕
    let btn = document.createElement("button");
    btn.id = "cart-btn";
    btn.textContent = "加入購物車";
    btn.onclick = () => {
        addCart();
        showCart();
    };
    document.getElementById("product-desc").append(btn);
    window.document.title = data["product_name"];

    //產品輪播照片
    let proPhotos = document.getElementById("product-photos");
    let imgList = data["photo"];
    for (let i = 0; i < imgList.length; i++) {
        let input = document.createElement("input");
        let li = document.createElement("li");
        let img = document.createElement("img");
        img.onload = () => {
                document.getElementById("product-lds").style.display = "none";
            }
            // let spinner = document.createElement("div");
        addAttributes(input, inputAttributes);
        li.setAttribute("class", "slide");
        img.src = "https://vaapadshopwear.s3.us-west-2.amazonaws.com/shopwear/" + imgList[i];
        // spinner.id = "spinner";
        img.onload = () => {
            document.getElementById("product-lds").style.display = "none";
        }
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
        document.cookie = "shopwearCart=" + arr + "&" + "; max-age=604800; domain=.dimalife.com; path=/";
    } else {
        currentItem = getCookie("shopwearCart");
        currentItem = currentItem + arr + "&";
        document.cookie = "shopwearCart=" + currentItem + "; max-age=604800; domain=.dimalife.com; path=/";
    }

}

// 商品照片左右按鈕輪播功能
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