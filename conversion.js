let textbox = document.getElementById("usdAmount");
function showToast(message, type = "error", duration = 3000) {
    const toast = document.createElement("div");
    toast.className = `toast-notification ${type}`;
    toast.textContent = message;

    document.body.appendChild(toast);

    // trigger animation
    setTimeout(() => toast.classList.add("show"), 50);

    // auto remove
    setTimeout(() => {
        toast.classList.remove("show");
        toast.addEventListener("transitionend", () => toast.remove());
    }, duration);
}

let getMoney = ()=>{
    try {
        let s1 = textbox.value;
        if(s1 === ""){
            throw new Error("Empty Value not allowed");
        }
        let n1 = Number(s1);
        if(Number.isNaN(n1)){
            throw new Error("Invalid Input");
        }
        if(n1 <= 0){
            throw new Error("Invalid Number");
        }
        fetchRate(n1);
    }
    catch(err){
        showToast(err);
        return;
    }
}
let fetchRate = (n1)=>{
    console.log(n1);

    fetch(`https://api.exchangerate-api.com/v4/latest/USD`)
    .then((response)=>response.json())
        .then((data)=>{showAmount(data,n1)})
    .catch((err)=>{showToast(err)});
}
let showAmount = (data,n1)=>{
    console.log(data,n1);

    let amount = n1 * data.rates.INR;
    amount = amount.toFixed(2);

    let amountbox = document.getElementById("result");
    amountbox.innerText = "Total Amount in Rs: "+amount;
}