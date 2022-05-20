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
    document.getElementById("product_name").textContent = data["product_name"];
    document.getElementById("price").textContent = "NT$ " + data["price"];
    document.getElementById("description").textContent = data["description"];
    document.getElementById("content").textContent = data["content"];
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