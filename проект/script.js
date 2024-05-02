let visitCount = localStorage.getItem('visitCount') || 0;

visitCount++;

localStorage.setItem('visitCount', visitCount);

document.getElementById('visitCounter').innerText = visitCount;

document.addEventListener('DOMContentLoaded', function () {
    const searchForm = document.getElementById('searchForm');
    const cityInput = document.getElementById('cityInput');
    const weatherIcon = document.getElementById('weatherIcon');
    const temperature = document.getElementById('temperature');
    const city = document.getElementById('city');
    const day = document.getElementById('day');
    const weatherConditionIcon = document.getElementById('weatherConditionIcon');
    const weatherCondition = document.getElementById('weatherCondition');
    const time = document.getElementById('time');
    const forecastCards = document.getElementById('forecastCards');
    const uvIndex = document.getElementById('uvIndex');
    const uvIndexDescription = document.getElementById('uvIndexDescription');
    const humidity = document.getElementById('humidity');
    const windSpeed = document.getElementById('windSpeed');
    const sunrise = document.getElementById('sunrise');
    const sunset = document.getElementById('sunset');
    const visibility = document.getElementById('visibility');
    const airQuality = document.getElementById('airQuality');
    const pressure = document.getElementById('pressure');
    const feelsLike = document.getElementById('feelsLike');
    const celsiusBtn = document.getElementById('celsiusBtn');
    const fahrenheitBtn = document.getElementById('fahrenheitBtn');
    const settingsBtn = document.getElementById('settingsBtn');
    const settingsModal = document.getElementById('settingsModal');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const celsiusModalBtn = document.getElementById('celsiusModalBtn');
    const fahrenheitModalBtn = document.getElementById('fahrenheitModalBtn');
    const lightThemeBtn = document.getElementById('lightThemeBtn');
    const darkThemeBtn = document.getElementById('darkThemeBtn');
    const moreAccordionBtn = document.getElementById('moreAccordionBtn');
    const moreAccordionContent = document.getElementById('moreAccordionContent');
    const locationBtn = document.getElementById('locationBtn');

    const openWeatherMapApiKey = '4d8fb5b93d4af21d66a2948710284366';

    let isCelsius = true;
    let isDarkTheme = true;

    let timeIntervalId = null;

    const savedSettings = JSON.parse(localStorage.getItem('weatherAppSettings'));
    if (savedSettings) {
        isCelsius = savedSettings.isCelsius;
        isDarkTheme = savedSettings.isDarkTheme;
        applySettings();
    }

    const savedLastSearchedCity = localStorage.getItem('lastSearchedCity');
    if (savedLastSearchedCity) {
        displayWeatherData(savedLastSearchedCity);
    } else {
        displayWeatherData('Лондон');
    }

    function applySettings() {
        if (isCelsius) {
            celsiusBtn.classList.add('bg-gray-700');
            fahrenheitBtn.classList.remove('bg-gray-700');
        } else {
            fahrenheitBtn.classList.add('bg-gray-700');
            celsiusBtn.classList.remove('bg-gray-700');
        }

        if (isDarkTheme) {
            document.body.classList.add('bg-gray-900', 'text-white');
            document.querySelectorAll('.rounded-lg, .bg-gray-200').forEach(element => {
                element.classList.remove('bg-gray-200', 'text-black');
                element.classList.add('bg-gray-800', 'text-white');
            });
            document.querySelectorAll('.text-black').forEach(element => {
                element.classList.remove('text-black');
                element.classList.add('text-gray-700');
            });
            document.querySelectorAll('.bg-gray-400').forEach(element => {
                element.classList.remove('bg-gray-400');
                element.classList.add('bg-gray-700');
            });
            document.querySelectorAll('.modal-content').forEach(element => {
                element.classList.remove('bg-gray-700');
                element.classList.add('bg-gray-200');
            });
        } else {
            document.body.classList.remove('bg-gray-900', 'text-white');
            document.querySelectorAll('.rounded-lg, .bg-gray-800').forEach(element => {
                element.classList.remove('bg-gray-800', 'text-white');
                element.classList.add('bg-gray-200', 'text-black');
            });
            document.querySelectorAll('.text-gray-700').forEach(element => {
                element.classList.remove('text-gray-700');
                element.classList.add('text-black');
            });
            document.querySelectorAll('.bg-gray-700').forEach(element => {
                element.classList.remove('bg-gray-700');
                element.classList.add('bg-gray-400');
            });
            document.querySelectorAll('.modal-content').forEach(element => {
                element.classList.remove('bg-gray-200');
                element.classList.add('bg-gray-700');
            });
        }
    }

    function saveSettings() {
        const settings = {
            isCelsius: isCelsius,
            isDarkTheme: isDarkTheme
        };
        localStorage.setItem('weatherAppSettings', JSON.stringify(settings));
    }

    function saveLastSearchedCity(city) {
        localStorage.setItem('lastSearchedCity', city);
    }

    function getCityCoordinates(cityName) {
        return fetch(`http://api.geonames.org/searchJSON?q=${cityName}&maxRows=1&username=alexandergn`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Ошибка при получении данных о городе');
                }
                return response.json();
            })
            .then(data => {
                if (data.geonames && data.geonames.length > 0) {
                    return { lat: data.geonames[0].lat, lng: data.geonames[0].lng };
                } else {
                    throw new Error('Не удалось получить координаты для указанного города');
                }
            })
            .catch(error => {
                console.error('Ошибка при получении координат города:', error);
            });
    }

    function updateTime(coordinates) {
        fetch(`http://api.geonames.org/timezoneJSON?lat=${coordinates.lat}&lng=${coordinates.lng}&username=alexandergn`)
            .then(response => response.json())
            .then(data => {
                if (data && data.time) {
                    const localTime = new Date(data.time).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
                    time.textContent = localTime;
                } else {
                    throw new Error('Не удалось получить локальное время для указанного города');
                }
            })
            .catch(error => {
                console.error('Ошибка при получении локального времени:', error);
            });
    }

    function getCurrentTimeAndUpdate(coordinates) {
        clearInterval(timeIntervalId);
        updateTime(coordinates);
        timeIntervalId = setInterval(() => updateTime(coordinates), 60000);
    }

    function getLocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(showPosition, showError);
        } else {
            alert("Геолокация не поддерживается этим браузером.");
        }
    }

    function showPosition(position) {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${openWeatherMapApiKey}&units=${isCelsius ? 'metric' : 'imperial'}`)
            .then(response => response.json())
            .then(data => {
                const cityName = data.name;
                displayWeatherData(cityName);
            })
            .catch(error => {
                console.error('Ошибка при получении данных о погоде:', error);
            });
    }

    function showError(error) {
        switch (error.code) {
            case error.PERMISSION_DENIED:
                alert("Пользователь отклонил запрос на геолокацию.");
                break;
            case error.POSITION_UNAVAILABLE:
                alert("Информация о местоположении недоступна.");
                break;
            case error.TIMEOUT:
                alert("Время запроса на получение местоположения пользователя истекло.");
                break;
            case error.UNKNOWN_ERROR:
                alert("Произошла неизвестная ошибка.");
                break;
        }
    }

    function displayWeatherData(cityName) {
        fetch(`https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${openWeatherMapApiKey}&units=${isCelsius ? 'metric' : 'imperial'}`)
            .then(response => response.json())
            .then(data => {
                weatherIcon.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}.png`;
                temperature.textContent = `${isCelsius ? data.main.temp : (data.main.temp * 9 / 5 + 32)}°${isCelsius ? 'C' : 'F'}`;
                city.textContent = data.name;
                const date = new Date();
                const dayOfWeek = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'][date.getDay()];
                day.textContent = `${dayOfWeek}, ${date.toLocaleDateString('ru-RU')}`;
                weatherConditionIcon.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}.png`;
                weatherCondition.textContent = data.weather[0].description;

                fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&appid=${openWeatherMapApiKey}&units=${isCelsius ? 'metric' : 'imperial'}`)
                    .then(response => response.json())
                    .then(data => {
                        function createForecastCard(isDarkTheme) {
                            const forecastCard = document.createElement('div');
                            if (isDarkTheme) {
                                forecastCard.className = 'bg-gray-700 p-4 mr-4 rounded flex flex-col items-center';
                            } else {
                                forecastCard.className = 'bg-gray-400 p-4 mr-4 rounded flex flex-col items-center';
                            }
                            return forecastCard;
                        }
                        const forecastCards = document.getElementById('forecastCards');
                        forecastCards.innerHTML = '';
                        data.list.forEach((forecast, index) => {
                            if (index % 5 === 0) {
                                const forecastCard = createForecastCard(isDarkTheme);
                                const date = new Date(forecast.dt_txt);
                                const weekday = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'][date.getDay()];
                                const icon = `https://openweathermap.org/img/wn/${forecast.weather[0].icon}.png`;
                                const temperature = isCelsius ? forecast.main.temp : (forecast.main.temp * 9 / 5 + 32);
                                forecastCard.innerHTML = `
                                <img src="${icon}" alt="${forecast.weather[0].description}" class="w-12 h-12 mb-2">
                                <p class="text-sm">${weekday}</p>
                                <p class="text-lg font-bold">${temperature.toFixed(1)}°${isCelsius ? 'C' : 'F'}</p>
                            `;
                                forecastCards.appendChild(forecastCard);
                            }
                        });
                    })
                    .catch(error => {
                        console.error('Ошибка при получении прогноза:', error);
                    });

                fetch(`https://api.openweathermap.org/data/2.5/uvi?lat=${data.coord.lat}&lon=${data.coord.lon}&appid=${openWeatherMapApiKey}`)
                    .then(response => response.json())
                    .then(uvData => {
                        uvIndex.textContent = `УФ-индекс: ${uvData.value || '-'}`;
                        uvIndexDescription.textContent = getUVIndexDescription(uvData.value);
                    })

                    .catch(error => {
                        console.error('Ошибка при получении данных об УФ-индексе:', error);
                    });

                function getUVIndexDescription(uvIndex) {
                    if (uvIndex >= 0 && uvIndex < 3) {
                        return 'Низкий';
                    } else if (uvIndex >= 3 && uvIndex < 6) {
                        return 'Умеренный';
                    } else if (uvIndex >= 6 && uvIndex < 8) {
                        return 'Высокий';
                    } else if (uvIndex >= 8 && uvIndex < 11) {
                        return 'Очень высокий';
                    } else if (uvIndex >= 11) {
                        return 'Экстремальный';
                    } else {
                        return 'Нет данных';
                    }
                }

                fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${data.coord.lat}&lon=${data.coord.lon}&appid=${openWeatherMapApiKey}`)
                    .then(response => response.json())
                    .then(data => {
                        const airQualityIndex = data.list[0].main.aqi;
                        let airQualityText;
                        switch (airQualityIndex) {
                            case 1:
                                airQualityText = 'Очень хорошее';
                                break;
                            case 2:
                                airQualityText = 'Хорошее';
                                break;
                            case 3:
                                airQualityText = 'Удовлетворительное';
                                break;
                            case 4:
                                airQualityText = 'Плохое';
                                break;
                            case 5:
                                airQualityText = 'Очень плохое';
                                break;
                            default:
                                airQualityText = 'Нет данных';
                        }
                        airQuality.textContent = `Качество воздуха: ${airQualityText} ${airQualityIndex}`;
                    })
                    .catch(error => {
                        console.error('Ошибка при получении данных о качестве воздуха:', error);
                    });

                function createHourlyForecastCard(isDarkTheme, forecast) {
                    const forecastCard = document.createElement('div');
                    forecastCard.className = `${isDarkTheme ? 'bg-gray-700' : 'bg-gray-400'} p-4 mr-4 rounded flex flex-col items-center w-48`;

                    const date = new Date(forecast.dt_txt);
                    const hour = date.getHours();
                    const icon = `https://openweathermap.org/img/wn/${forecast.weather[0].icon}.png`;
                    const temperature = isCelsius ? forecast.main.temp : (forecast.main.temp * 9 / 5 + 32);
                    forecastCard.innerHTML = `
                        <img src="${icon}" alt="${forecast.weather[0].description}" class="w-12 h-12 mb-2">
                        <p class="text-sm">${hour}:00</p>
                        <p class="text-lg font-bold">${temperature.toFixed(1)}°${isCelsius ? 'C' : 'F'}</p>
                    `;

                    return forecastCard;
                }

                fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&appid=${openWeatherMapApiKey}&units=${isCelsius ? 'metric' : 'imperial'}`)
                    .then(response => response.json())
                    .then(data => {
                        const hourlyForecastContainer = document.getElementById('hourlyForecast');
                        hourlyForecastContainer.innerHTML = '';
                        const todaysForecast = data.list.filter(forecast => {
                            const forecastDate = new Date(forecast.dt_txt);
                            const today = new Date();
                            return (
                                forecastDate.getDate() === today.getDate() &&
                                forecastDate.getMonth() === today.getMonth() &&
                                forecastDate.getFullYear() === today.getFullYear()
                            );
                        });

                        todaysForecast.forEach(forecast => {
                            const forecastCard = createHourlyForecastCard(isDarkTheme, forecast);
                            hourlyForecastContainer.appendChild(forecastCard);
                        });
                    })
                    .catch(error => {
                        console.error('Ошибка при получении почасового прогноза:', error);
                    });

                function getWindDirection(deg) {
                    const directions = ['С', 'СВ', 'В', 'ЮВ', 'Ю', 'ЮЗ', 'З', 'СЗ'];
                    const index = Math.round(deg / 45) % 8;
                    return directions[index];
                }


                pressure.textContent = `Давление: ${data.main.pressure} гПа`;
                humidity.textContent = `Влажность: ${data.main.humidity}%`;
                windSpeed.textContent = `Ветер: ${getWindDirection(data.wind.deg)} ${data.wind.speed} ${isCelsius ? 'м/с' : 'миль/ч'}`;
                const timezoneOffset = data.timezone / 3600;
                const sunriseTimeUTC = new Date(data.sys.sunrise * 1000);
                const sunsetTimeUTC = new Date(data.sys.sunset * 1000);
                const sunriseTime = new Date(sunriseTimeUTC.getTime() + timezoneOffset * 60 * 60 * 1000).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
                const sunsetTime = new Date(sunsetTimeUTC.getTime() + timezoneOffset * 60 * 60 * 1000).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
                sunrise.textContent = `Восход: ${sunriseTime}`;
                sunset.textContent = `Закат: ${sunsetTime}`;
                visibility.textContent = `Видимость: ${data.visibility / 1000} км`;
                feelsLike.textContent = `Ощущается как: ${isCelsius ? data.main.feels_like : (data.main.feels_like * 9 / 5 + 32).toFixed(1)}°${isCelsius ? 'C' : 'F'}`;

                getCityCoordinates(cityName)
                    .then(coordinates => {
                        getCurrentTimeAndUpdate(coordinates);
                    });
                saveLastSearchedCity(cityName);
            })
            .catch(error => {
                console.error('Ошибка при отображении данных о погоде:', error);
            });
    }

    searchForm.addEventListener('submit', event => {
        event.preventDefault();
        const city = cityInput.value.trim();
        if (city) {
            displayWeatherData(city);
            saveLastSearchedCity(city);
        } else {
            alert('Введите название города!');
        }
    });

    celsiusBtn.addEventListener('click', function () {
        isCelsius = true;
        displayWeatherData(city.textContent);
        saveSettings();
    });

    fahrenheitBtn.addEventListener('click', function () {
        isCelsius = false;
        displayWeatherData(city.textContent);
        saveSettings();
    });

    settingsBtn.addEventListener('click', function () {
        settingsModal.classList.remove('hidden');
        backdrop.classList.remove('hidden');
    });

    closeModalBtn.addEventListener('click', function () {
        settingsModal.classList.add('hidden');
        backdrop.classList.add('hidden');
    });

    document.addEventListener('click', function (event) {
        if (event.target === settingsModal || event.target === backdrop) {
            settingsModal.classList.add('hidden');
            backdrop.classList.add('hidden');
        }
    });

    celsiusModalBtn.addEventListener('click', function () {
        isCelsius = true;
        displayWeatherData(city.textContent);
        saveSettings();
    });

    fahrenheitModalBtn.addEventListener('click', function () {
        isCelsius = false;
        displayWeatherData(city.textContent);
        saveSettings();
    });

    lightThemeBtn.addEventListener('click', function () {
        isDarkTheme = false;
        applySettings();
        saveSettings();
    });

    darkThemeBtn.addEventListener('click', function () {
        isDarkTheme = true;
        applySettings();
        saveSettings();
    });

    moreAccordionBtn.addEventListener('click', function () {
        moreAccordionContent.classList.toggle('hidden');
        const icon = document.getElementById('accordionIcon');
        icon.classList.toggle('rotate-up');
    });

    locationBtn.addEventListener('click', getLocation);

    todaysForecast.forEach((forecast, index) => {
        const forecastCard = createForecastCard(isDarkTheme, forecast);
        forecastCard.style.setProperty('--animation-order', index);
        hourlyForecastContainer.appendChild(forecastCard);
    });


});