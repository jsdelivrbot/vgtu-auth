    window.onload = function() {
    	var url = window.location.pathname;
    	var key = url.split('/').pop().split('#')[0].split('?')[0];

        var message = localStorage.getItem('passwd');  


		var iv  = "mHGFxENnZLbienLyANoi.e";
		iv = CryptoJS.enc.Base64.parse(iv);

		var encrypted = CryptoJS.AES.encrypt(message, key, { iv: iv });



		xhr = new XMLHttpRequest();
		var url = "/challenge/" + key;
		xhr.open("POST", url, true);
		xhr.setRequestHeader("Content-type", "application/json");

		var data = JSON.stringify({'passwd': encrypted.ciphertext.toString()});
		xhr.send(data);




		window.location.replace('/profile');
    }