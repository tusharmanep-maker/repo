<!-- firebase.js -->
<script>
(function(){
  function loadScript(src){ return new Promise((res, rej) => {
    const s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = rej; document.head.appendChild(s);
  }); }

  loadScript('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js')
  .then(()=> loadScript('https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore-compat.js'))
  .then(()=> {
    // REPLACE with your firebase config
    const firebaseConfig = {
      apiKey: "YOUR_API_KEY",
      authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
      projectId: "YOUR_PROJECT_ID",
      storageBucket: "YOUR_PROJECT_ID.appspot.com",
      messagingSenderId: "SENDER_ID",
      appId: "APP_ID"
    };
    firebase.initializeApp(firebaseConfig);
    window.db = firebase.firestore();

    console.log('Firebase initialized (window.db)');
  })
  .catch(err => console.error('Failed to load firebase', err));
})();
</script>
