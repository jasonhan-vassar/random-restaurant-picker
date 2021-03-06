/*=========================
    RESTAURANT QUERY AND RE-ROLL
 =========================*/
describe("Test the query function", ()=>{
    let dummyElement;
    let htmlReponse;

    beforeEach(() => {
        htmlResponse = new Response('{\"pick\":{\"name\":\"Chipotle\",\"rating\":\"4.5\", \"price\": \"2\", \"vicinity\": \"West Chester Avenue\",\"photos\":[\"photo1\",\"photo2\"]},\"results\":[{\"name\":\"Qdoba\",\"rating\":\"4\",\"photos\":[\"photo1\",\"photo2\"]}],\"status\":\"OK\"}');
        dummyElement = document.createElement('div');
        spyOn(document, 'getElementById').and.returnValue(dummyElement);
        spyOn(window, 'query').and.callThrough();
        spyOn(window, 'redirectToUrl');
    });

    it("Test the query function works properly", async () => {
        spyOn(window, 'fetch').and.returnValue(Promise.resolve(htmlResponse));
        spyOn(localStorage, 'setItem');
        await query("string");
        expect(fetch).toHaveBeenCalledWith('/query?string', { method: 'POST' });
        expect(redirectToUrl).toHaveBeenCalled();
        expect(localStorage.setItem).toHaveBeenCalledWith('restaurantAddress', 'West Chester Avenue');
    });

    it("Test the query function when an invalid request is returned", async () => {
        dummyElement.classList.add("success-banner");
        dummyElement.classList.add("hidden");
        spyOn(window, 'fetch').and.returnValue(Promise.resolve(new Response('{"status": "INVALID_REQUEST"}')));
        await query("string");
        expect(fetch).toHaveBeenCalledWith('/query?string', { method: 'POST' });
        expect(dummyElement.innerText).toEqual("Invalid request");
        expect(dummyElement.classList.contains("error-banner")).toBeTruthy();
        expect(dummyElement.classList.contains("hidden")).toBeFalsy();
        expect(dummyElement.classList.contains("success-banner")).toBeFalsy();
        expect(redirectToUrl).toHaveBeenCalledTimes(0);
    });

     it("Test the query function when zero results are returned", async () => {
        dummyElement.classList.add("success-banner");
        dummyElement.classList.add("hidden");
        spyOn(window, 'fetch').and.returnValue(Promise.resolve(new Response('{"status": "ZERO_RESULTS"}')));
        await query("string");
        expect(fetch).toHaveBeenCalledWith('/query?string', { method: 'POST' });
        expect(dummyElement.innerText).toEqual("No results");
        expect(dummyElement.classList.contains("error-banner")).toBeTruthy();
        expect(dummyElement.classList.contains("hidden")).toBeFalsy();
        expect(dummyElement.classList.contains("success-banner")).toBeFalsy();
        expect(redirectToUrl).toHaveBeenCalledTimes(0);
    });

    it("Test the query function when no rerolls are returned", async () => {
        dummyElement.classList.add("success-banner");
        dummyElement.classList.add("hidden");
        spyOn(window, 'fetch').and.returnValue(Promise.resolve(new Response('{"status": "NO_REROLLS"}')));
        await query("string");
        expect(fetch).toHaveBeenCalledWith('/query?string', { method: 'POST' });
        expect(dummyElement.innerText).toEqual("No re-rolls left");
        expect(dummyElement.classList.contains("error-banner")).toBeTruthy();
        expect(dummyElement.classList.contains("hidden")).toBeFalsy();
        expect(dummyElement.classList.contains("success-banner")).toBeFalsy();
        expect(redirectToUrl).toHaveBeenCalledTimes(0);
    });
});

describe("Test the roll function", () => {
    let dummyPick;
    let dummyRating;
    let htmlResponse;

    beforeEach(() => {
        htmlResponse = new Response('{\"pick\":{\"name\":\"Chipotle\",\"rating\":\"4.5\",\"photos\":[\"photo1\",\"photo2\"]},\"results\":[{\"name\":\"Qdoba\",\"rating\":\"4\",\"photos\":[\"photo1\",\"photo2\"]}],\"status\":\"OK\"}');
        dummyPick = document.createElement('div');
        dummyRating = document.createElement('div');
        spyOn(window, 'roll').and.callThrough();
        spyOn(document, 'getElementById').and.returnValues(dummyPick, dummyRating);
        spyOn(window, 'loadImage');
        spyOn(window, 'calculateAndDisplayRoute');
    });

    it("Test that Roll works properly", async () => {
        spyOn(window, 'fetch').and.returnValue(Promise.resolve(htmlResponse));
        await roll();
        expect(roll).toHaveBeenCalled();
        expect(fetch).toHaveBeenCalled();
        expect(document.getElementById).toHaveBeenCalledTimes(2);
        expect(loadImage).toHaveBeenCalled();
        expect(dummyPick.innerText).toEqual("Chipotle");
        expect(dummyRating.innerText).toEqual("4.5 ★");
    });

    it("Test Roll when an invalid request error is returned", async () => {
        spyOn(window, 'fetch').and.returnValue(Promise.resolve(new Response('{"status": "INVALID_REQUEST"}')));
        await roll();
        expect(roll).toHaveBeenCalled();
        expect(fetch).toHaveBeenCalled();
        expect(document.getElementById).toHaveBeenCalledTimes(2);
        expect(loadImage).toHaveBeenCalledTimes(0);
        expect(dummyPick.innerText).toEqual("Invalid request");
    });

    it("Test Roll when a zero results error is returned", async () => {
        spyOn(window, 'fetch').and.returnValue(Promise.resolve(new Response('{"status": "ZERO_RESULTS"}')));
        await roll();
        expect(roll).toHaveBeenCalled();
        expect(fetch).toHaveBeenCalled();
        expect(document.getElementById).toHaveBeenCalledTimes(2);
        expect(loadImage).toHaveBeenCalledTimes(0);
        expect(dummyPick.innerText).toEqual("No results");
    });

    it("Test Roll when a no rerolls error is returned", async () => {
        spyOn(window, 'fetch').and.returnValue(Promise.resolve(new Response('{"status": "NO_REROLLS"}')));
        await roll();
        expect(roll).toHaveBeenCalled();
        expect(fetch).toHaveBeenCalled();
        expect(document.getElementById).toHaveBeenCalledTimes(2);
        expect(loadImage).toHaveBeenCalledTimes(0);
        expect(dummyPick.innerText).toEqual("No re-rolls left");
    });

    it("Test Roll when an unknown error is returned", async () => {
        spyOn(window, 'fetch').and.returnValue(Promise.resolve(new Response('{"status": "UNKNOWN_ERROR"}')));
        await roll();
        expect(roll).toHaveBeenCalled();
        expect(fetch).toHaveBeenCalled();
        expect(document.getElementById).toHaveBeenCalledTimes(2);
        expect(loadImage).toHaveBeenCalledTimes(0);
        expect(dummyPick.innerText).toEqual("Unforeseen error");
    });
});

/*=========================
    USER'S LOCATION AND ADDRESS
 =========================*/
describe("Test the geoLocEnabled function", () => {
    let dummyElement;

    beforeEach(() => {
        dummyElement = document.createElement('div');
        spyOn(document, 'getElementById').and.returnValue(dummyElement);
        spyOn(window, 'geoLocEnabled').and.callThrough();
        spyOn(localStorage, 'setItem');
    });

    it("Test that the function runs correctly", async () => {
        spyOn(window, 'convertLocation').and.returnValue(Promise.resolve("155 W 51st St, New York, NY 10019"));
        await geoLocEnabled({coords: {latitude: 40, longitude: -80}});
        expect(geoLocEnabled).toHaveBeenCalled();
        expect(convertLocation).toHaveBeenCalled();
        expect(localStorage.setItem).toHaveBeenCalledTimes(2);
        expect(dummyElement.innerText).toEqual("155 W 51st St, New York, NY 10019");
    });
});

describe("Test the geoLocFallback function", () => {
    let dummyElement;

    beforeEach(() => {
        dummyElement = document.createElement('div');
        spyOn(window, 'geoLocFallback').and.callThrough();
        spyOn(document, 'getElementById').and.returnValue(dummyElement);
        spyOn(window, 'convertLocation').and.returnValue(Promise.resolve("155 W 51st St, New York, NY 10019"));
        spyOn(window, 'geoLocHardcoded');
        spyOn(localStorage, 'setItem');
    });

    it("Test that the function runs correctly", async () => {
        spyOn(window, 'fetch').and.returnValue(Promise.resolve(new Response('{"location": {"lat": 40, "lng": -80}}')));
        await geoLocFallback();
        expect(geoLocFallback).toHaveBeenCalled();
        expect(convertLocation).toHaveBeenCalled();
        expect(dummyElement.innerText).toEqual("155 W 51st St, New York, NY 10019");
        expect(geoLocHardcoded).toHaveBeenCalledTimes(0);
        expect(localStorage.setItem).toHaveBeenCalledTimes(2);
    });

    /*it("Test the function when server returns a 404 error", async () => {
        let init = {"status": 404};
        spyOn(window, 'fetch').and.returnValue(Promise.resolve(new Response("", init)))
        await geoLocFallback();
        expect(geoLocFallback).toHaveBeenCalled();
        expect(geoLocHardcoded).toHaveBeenCalled();
        expect(function(){geoLocFallback}).toThrow();
    });*/
});

describe("Test the geoLocHardcoded function", () => {
    let dummyElement;

    beforeEach(() => {
        dummyElement = document.createElement('div');
        spyOn(window, 'geoLocHardcoded').and.callThrough();
        spyOn(document, 'getElementById').and.returnValue(dummyElement);
    });

    it("Test the function runs correctly", async () => {
        spyOn(window, 'convertLocation').and.returnValue(Promise.resolve("155 W 51st St, New York, NY 10019"));
        await geoLocHardcoded();
        expect(convertLocation).toHaveBeenCalled();
        expect(geoLocHardcoded).toHaveBeenCalled();
        expect(dummyElement.innerText).toEqual("155 W 51st St, New York, NY 10019");
    });

    it("Test the function when an error is throw", async () => {
        spyOn(window, 'convertLocation').and.returnValue(Promise.resolve("Couldn't convert the address"));
        await geoLocHardcoded();
        expect(convertLocation).toHaveBeenCalled();
        expect(geoLocHardcoded).toHaveBeenCalled();
        expect(dummyElement.innerText).toEqual("Couldn't convert the address");
    });
});

describe("Test the convertLocation function", () => {
    beforeEach(() => {
        spyOn(window, 'convertLocation').and.callThrough();
    });

    it("Check that the function runs properly", async () => {
        let location = new Response('{\"plus_code\":{\"compound_code\":\"2232+5C Fredericktown, PA, USA\",\"global_code\":\"87G22232+5C\"},\"results\":[{\"formatted_address\":\"17 Water St, Fredericktown, PA 15333, USA\",\"geometry\":{\"location\":{\"lat\":40.00271559999999,\"lng\":-79.9978914},\"location_type\":\"ROOFTOP\",\"viewport\":{\"northeast\":{\"lat\":40.0040645802915,\"lng\":-79.99654241970849},\"southwest\":{\"lat\":40.0013666197085,\"lng\":-79.9992403802915}}},\"place_id\":\"ChIJc9FCJiYPNYgRO5lqnx-nPt8\",\"plus_code\":{\"compound_code\":\"2232+3R Fredericktown, PA, USA\",\"global_code\":\"87G22232+3R\"},\"types\":[\"street_address\"]}],\"status\":\"OK\"}');
        spyOn(window, 'fetch').and.returnValue(Promise.resolve(location));
        let response =  await convertLocation({lat: 40.003, lng: -79.999});
        expect(convertLocation).toHaveBeenCalled();
        expect(fetch).toHaveBeenCalledWith('/convert?lat=40.003&lng=-79.999');
        expect(response).toEqual("17 Water St, Fredericktown, PA 15333, USA");
    });

    it("Check the function response with invalid return", async () => {
        let location = new Response('{\"plus_code\":{\"compound_code\":\"2232+52 K\u00fc\u00e7\u00fckotlukbeli\/Otlukbeli\/Erzincan, Turkey\",\"global_code\":\"8HG22232+52\"},\"results\":[],\"status\":\"ZERO_RESULTS\"}');
        spyOn(window, 'fetch').and.returnValue(Promise.resolve(location));
        let response = await convertLocation({lat: 40.003, lng: 40});
        expect(convertLocation).toHaveBeenCalled();
        expect(fetch).toHaveBeenCalledWith('/convert?lat=40.003&lng=40');
        expect(response).toEqual("Couldn't convert the address");
    });
});

/*=========================
    HTML
 =========================*/
describe("Test Load Image Function", () => {
    it("see the the load image function runs", function() {
        spyOn(window, 'loadImage');
        loadImage('link');
        expect(loadImage).toHaveBeenCalledWith('link');
    });
});