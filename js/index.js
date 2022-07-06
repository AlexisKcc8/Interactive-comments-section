import { ajax } from "./helpers.js";

const d = document;
const $containerComments = d.getElementById("container-comments");
const $templateCard = d.getElementById('template-card-post').content;
const $fragmentCard = d.createDocumentFragment();
const $inputComment = d.querySelector(".container-my-comment__txt");

const $layerModal = d.querySelector(".layer-modal");
const $btnModalCancel = d.querySelector(".layer-modal__btn-cancel");
const $btnModalDelete = d.querySelector(".layer-modal__btn-delete");


let arrayComments = [];

d.addEventListener('DOMContentLoaded', ()=>{  
    if(localStorage.getItem('arrayComments') !== null){
        arrayComments = JSON.parse(localStorage.getItem('arrayComments'));
        paintComments();
    }else{
        getDataAndSaveLocaStorage();
        console.log("se creo correctamente el array");
        setTimeout(()=>{
            arrayComments = JSON.parse(localStorage.getItem('arrayComments'));
            paintComments();
        },50);
    }
});


const getDataAndSaveLocaStorage = ()=>{
    ajax({
        url:"../data.json",
        cbSuccess:(json)=>{
            let dataComments = JSON.stringify(json.comments);
            console.log(dataComments);
            localStorage.setItem('arrayComments', dataComments);
        },
        cbError:(error)=>{
            console.log(error);
        }
    })
}

const paintComments = () => {
  $containerComments.textContent = "";
  arrayComments.forEach((comment) => {
    let $cloneCard = $templateCard.cloneNode(true);
    const $cardComment = $cloneCard.querySelector(".card-post");
    const $imgProfile = $cloneCard.querySelector(".card-post__img-profile");
    const $nameUser = $cloneCard.querySelector(".card-post__name-profile");
    const $creationDate = $cloneCard.querySelector(".card-post__creation-date");
    const $contentText = $cloneCard.querySelector(".card-post__text");
    const $totalScore = $cloneCard.querySelector(".card-post__total-score");

    $cardComment.dataset.id = comment.id;
    $imgProfile.src = comment.user.image.png;
    $nameUser.textContent = comment.user.username;
    if ($nameUser.textContent === "juliusomo") {
      isMyUser($cloneCard);
    }
    if(comment.replies.length > 0) {
      console.log($nameUser.textContent);
      paintReplies(comment.replies);
    }
    $creationDate.textContent = comment.createdAt;
    $contentText.textContent = comment.content;
    $totalScore.textContent = comment.score;

    $fragmentCard.appendChild($cloneCard);
  });
  $containerComments.appendChild($fragmentCard);
};
//* adaptar el alto de los textarea dependiendo de su contenido
const fixedHeightTextCard = () => {
  setTimeout(() => {
    let area = document.querySelectorAll(".card-post__text");
    area.forEach((elemento) => {
      elemento.style.height = `${elemento.scrollHeight}px`;
    });
  }, 50);
};
const paintReplies = (replies)=>{
  console.log(replies);
}
const isMyUser = ($cloneCard) => {
  const $tagYou = $cloneCard.querySelector(".card-post__tag-you");
  $tagYou.classList.add("card-post__tag-you--show");

  const $btnDelete = $cloneCard.querySelector(".card-post__btn-delete");
  const $btnEdit = $cloneCard.querySelector(".card-post__btn-edit");
  const $btnReply = $cloneCard.querySelector(".card-post__btn-reply");
  const $date = $cloneCard.querySelector(".card-post__creation-date");

  $btnReply.style.display = "none";
  $date.style.margin = 0;

  $btnDelete.classList.add("card-post__btn-edit-btn-delete-show");
  $btnEdit.classList.add("card-post__btn-edit-btn-delete-show");
};
const setComment = () => {
  const ids = arrayComments.map(comment => comment.id);
  let idMax = Math.max(...ids);
  const comment = {
    id: idMax + 1,
    content: $inputComment.value,
    createdAt: new Date().toLocaleDateString(),
    score: 0,
    user: {
      image: {
        png: "../images/avatars/image-juliusomo.png",
        webp: "../images/avatars/image-juliusomo.webp",
      },
      username: "juliusomo",
    },
    replies: [],
  };
  arrayComments.push(comment);
  localStorage.setItem("arrayComments", JSON.stringify(arrayComments));
  paintComments();
};

const btnAumentarDisminuir = (e) => {
  if (e.target.classList.contains("card-post__btn-plus") || e.target.classList.contains("card-post__btn-img-plus")) {
    let positionCard = e.target.closest(".card-post").dataset.id;
    const comment = arrayComments.find((card) => card.id == positionCard);
    const indexComment = arrayComments.indexOf(comment);
    comment.score++;
    arrayComments[indexComment] = {...comment};
    localStorage.setItem("arrayComments", JSON.stringify(arrayComments));
    paintComments();
  }
  if (e.target.matches(".card-post__btn-minus") ||e.target.matches(".card-post__btn-minus *")) {
    let positionCard = e.target.closest(".card-post").dataset.id;
    const comment = arrayComments.find((card) => card.id == positionCard);
    const indexComment = arrayComments.indexOf(comment);
    comment.score--;
    arrayComments[indexComment] = {...comment};
    localStorage.setItem("arrayComments", JSON.stringify(arrayComments));
    paintComments();
  }
};
  
d.addEventListener("click", (e)=>{
    
    btnAumentarDisminuir(e);

    if(e.target.matches(".card-post__btn-reply") || e.target.matches(".card-post__btn-reply *")){
        const $cardComment = e.target.closest(".card-post");
        $cardComment.insertAdjacentHTML('afterend', 
        `<section class="container-my-comment" id="container-my-comment" style="margin:0 0 1rem 0">
    
        <textarea class="container-my-comment__txt" name="comment" id="my-comment-post" placeholder="Add a comment..."
        required></textarea>
        
        <img class="container-my-comment__img-profile" src="./images/avatars/image-juliusomo.png" alt="juliusomo.png">
      
        <button class="container-my-comment__btn-send" type="submit">REPLY</button>
      
      </section>`
        );

    }
    if(e.target.matches(".container-my-comment__btn-send")){
      if($inputComment.value === ""){
        alert("por favor, escribe un comentario antes de enviarlo")
      }else{
        setComment();
          $inputComment.value = "";
      }  
        
    }
    if (e.target.matches(".card-post__btn-delete")) {
      let idCard = e.target.closest(".card-post").dataset.id;
      $layerModal.classList.add("layer-modal--show");
      $btnModalDelete.dataset.idComment = idCard;
     
    }
    if (e.target.matches(".card-post__btn-edit")) {
      const $containerText = e.target.closest(".card-post").children[1];
      const $textComment = e.target.closest(".card-post").children[1].firstElementChild;
      // creacion de nuevos componentes  
      const $textAreaComment = document.createElement("textarea");
      $textAreaComment.classList.add("card-post__text-area");
      $textAreaComment.value = $textComment.textContent;
      $textAreaComment.style.minHeight = "5rem"
      $textAreaComment.style.height = `${$textComment.scrollHeight}px`;
      
      $containerText.replaceChild($textAreaComment, $textComment);

      const $btnUpdate = document.createElement("button");
      $btnUpdate.textContent = "UPDATE"
      $btnUpdate.classList.add("card-post__update");
      $containerText.appendChild($btnUpdate);
     
    }
    if (e.target === $btnModalCancel) {
      $layerModal.classList.remove("layer-modal--show");
    }
    if (e.target === $btnModalDelete) {
      const indexComment = arrayComments.findIndex((c) => c.id == e.target.dataset.idComment);
      arrayComments.splice(indexComment, 1);
      localStorage.setItem("arrayComments", JSON.stringify(arrayComments));
      paintComments();
      $layerModal.classList.remove("layer-modal--show");
    }
    if (e.target.matches(".card-post__update")) {
      let idCard = e.target.closest(".card-post").dataset.id;
      const myCardComent = arrayComments.find((c) => c.id == idCard);
      const indexCardComment = arrayComments.indexOf(myCardComent);
      const $textAreaComment = e.target.closest(".card-post").children[1].firstElementChild;
      myCardComent.content = $textAreaComment.value;
      arrayComments[indexCardComment] = {...myCardComent};
      localStorage.setItem("arrayComments", JSON.stringify(arrayComments));
      paintComments();
    }
});


