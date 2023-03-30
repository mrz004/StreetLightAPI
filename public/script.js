const key = "55555";
const bulbs = Array.from(document.getElementsByClassName("bulb"));

const liteBubls = () => {
  bulbs.forEach(async (e, i) => {
    res = await fetch(`/status?key=${key}&id=${i + 1}`);
    state = await res.text();

    if (state.toLocaleLowerCase() === "1") {
      e.src = "/imgs/light-on.png";
      e.setAttribute("title", "on");
    } else {
      e.src = "/imgs/light.png";
      e.setAttribute("title", "off");
    }
  });
};

setInterval(liteBubls, 500);

liteBubls();

// bulbs.forEach((e, i) => {
//   // const id = i+1;
//   e.addEventListener("click", event => {
//     fetch(`/set?key=${key}&id=${i + 1}&value=${event.target.title === "on" ? 0 : 1}`)
//     liteBubls();
//   })
// });
