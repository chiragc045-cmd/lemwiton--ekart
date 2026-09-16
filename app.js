const track=document.getElementById("sliderTrack");
const dots=[...document.querySelectorAll(".dot")];
const prevBtn=document.getElementById("prevBtn");
const nextBtn=document.getElementById("nextBtn");
let currentSlide=0,autoPlay;

function showSlide(index){
  currentSlide=(index+dots.length)%dots.length;
  track.style.transform=`translateX(-${currentSlide*100}%)`;
  dots.forEach((dot,i)=>dot.classList.toggle("active",i===currentSlide));
}
function nextSlide(){showSlide(currentSlide+1)}
function prevSlide(){showSlide(currentSlide-1)}
function startAutoPlay(){autoPlay=setInterval(nextSlide,4000)}
function restartAutoPlay(){clearInterval(autoPlay);startAutoPlay()}

nextBtn.addEventListener("click",()=>{nextSlide();restartAutoPlay()});
prevBtn.addEventListener("click",()=>{prevSlide();restartAutoPlay()});
dots.forEach(dot=>dot.addEventListener("click",()=>{showSlide(Number(dot.dataset.slide));restartAutoPlay()}));
startAutoPlay();
