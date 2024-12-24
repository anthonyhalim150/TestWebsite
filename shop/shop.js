document.getElementById('customer-support').addEventListener('click', function () {
        // Check if the script is already loaded
        if (!document.getElementById('tawk-script')) {
            // Dynamically create the script element
            var s1 = document.createElement("script");
            s1.async = true;
            s1.src = 'https://embed.tawk.to/675fd299af5bfec1dbdc8347/1if74tanu';
            s1.id = 'tawk-script'; // Add an ID to prevent duplicate loading
            s1.setAttribute('crossorigin', '*');
            document.body.appendChild(s1);
        } else {
            // If the script is already loaded, toggle the widget
            if (typeof Tawk_API !== 'undefined') {
                Tawk_API.toggle();
            }
        }
    }
);


