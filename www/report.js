"use strict"


const url = 'https://rti2dss.com:3500';
// const url = 'http://localhost:3500';
$(document).ready(async function () {
    loadMap();

    $('#saveEdit').click(e => {
        // e.preventDefault();
        let obj = {
            validation: $('#validation').val(),
            status_fix: $('#status_fix').val(),
            date_fix: $('#date_fix').val(),
            gid: $('#gid').val()
        }
        $.post(url + '/acc-api/pin-risk-solve', obj).done(res => {
            console.log(res)
            // getData()
        })
    })

    $('#remove').click(e => {
        let obj = {
            validation: $('#validation').val(),
            status_fix: $('#status_fix').val(),
            date_fix: $('#date_fix').val(),
            gid: $('#gid').val()
        }
        // remove()
        if (riskpoint) {
            map.removeLayer(riskpoint)
        }

        $.post(url + '/acc-api/pin-risk-remove', obj).done(res => {
            console.log(res);
            getData()
        })
    })
})

let latlng = {
    lat: 17.624278,
    lng: 100.096524
};
let map = L.map("map", {
    center: latlng,
    zoom: 13
});

var marker;
let riskpoint;
let layerControl

function loadMap() {
    const Mapnik = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });

    const grod = L.tileLayer('https://{s}.google.com/vt/lyrs=r&x={x}&y={y}&z={z}', {
        maxZoom: 20,
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
    });
    const ghyb = L.tileLayer('https://{s}.google.com/vt/lyrs=y,m&x={x}&y={y}&z={z}', {
        maxZoom: 20,
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
    });

    const pro = L.tileLayer.wms("http://rti2dss.com:8080/geoserver/th/wms?", {
        layers: 'th:province_4326',
        format: 'image/png',
        transparent: true,
        zIndex: 5,
        CQL_FILTER: 'pro_code=53'

    });
    const amp = L.tileLayer.wms('http://rti2dss.com:8080/geoserver/th/wms?', {
        layers: 'th:amphoe_4326',
        format: 'image/png',
        transparent: true,
        zIndex: 5,
        CQL_FILTER: 'pro_code=53'
    });
    const tam = L.tileLayer.wms('http://rti2dss.com:8080/geoserver/th/wms?', {
        layers: 'th:tambon_4326',
        format: 'image/png',
        transparent: true,
        zIndex: 5,
        CQL_FILTER: 'pro_code=53'
    });

    var baseMap = {
        "OSM": Mapnik.addTo(map),
        "แผนที่ถนน": grod,
        "แผนที่ภาพถ่าย": ghyb
    }

    let overlay = {
        'ขอบเขตตำบล': tam.addTo(map),
        'ขอบเขตอำเภอ': amp.addTo(map),
        'ขอบเขตจังหวัด': pro.addTo(map),
    }

    layerControl = L.control.layers(baseMap, overlay).addTo(map);

    getData()

    // layerControl.addOverlay(riskpoint.addTo(map), 'จุดเสี่ยง');
}

function getData() {
    $("#riskList").empty()
    $('#saveEdit').prop('disabled', true)
    $('#validation').prop('disabled', true)
    $('#status_fix').prop('disabled', true)
    $('#remove').prop('disabled', true)
    $.get(url + '/cp-api/getdata').done(res => {
        // console.log(res)
        const redMarker = L.icon({
            iconUrl: './marker/marker-red.svg',
            iconSize: [30, 30],
            // iconAnchor: [15, 20],
            popupAnchor: [0, -10]
        });
        const greenMarker = L.icon({
            iconUrl: './marker/marker-green.svg',
            iconSize: [30, 30],
            // iconAnchor: [15, 20],
            // iconAnchor: [22, 94],
            popupAnchor: [0, -10]
        });

        let items = 0;
        riskpoint = L.geoJSON(res, {
            pointToLayer: function (feature, latlng) {
                let icon = redMarker
                return L.marker(latlng, {
                    icon: icon,
                    iconName: 'risk',
                    attribute: feature.properties
                });
            },
            onEachFeature: (feature, layer) => {
                items += 1;
                $("#riskList").append(`<a class="list-group-item list-group-item-action"
                    onclick="zoomCenter(${feature.properties.lat},${feature.properties.lon},'${feature.properties.sname}','${feature.properties.stype}')">
                    โรงเรียน: ${feature.properties.schoolname}<br>
                    ชั้น: ${feature.properties.classname}</a>`);
                layer.bindPopup('โรงเรียน: ' + feature.properties.schoolname + '<br>ชั้น: ' + feature.properties.classname);
            }
        }).addTo(map);
        $('#items').text('' + items)

        map.fitBounds(riskpoint.getBounds());
    })
}

function remove() {
    console.log(layerControl)
    if (riskpoint) {
        map.removeLayer(riskpoint)
    }
    $("#riskList").empty()
    getData()
}

function zoomCenter(lat, lon, sname, stype) {
    var popup = L.popup({ offset: [0, -10] })
        .setLatLng([lat, lon])
        .setContent('สถานที่: ' + sname + '<br>ประเภท: ' + stype);
    popup.openOn(map)
    map.panTo([lat, lon])
}

// function showDetail(gid) {
//     $('#saveEdit').prop('disabled', false)
//     $('#validation').prop('disabled', false)
//     $('#status_fix').prop('disabled', false)
//     $('#remove').prop('disabled', false)
//     let icon = 'data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIj8+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiBpZD0iQ2FwYV8xIiBlbmFibGUtYmFja2dyb3VuZD0ibmV3IDAgMCA1MTIgNTEyIiBoZWlnaHQ9IjUxMnB4IiB2aWV3Qm94PSIwIDAgNTEyIDUxMiIgd2lkdGg9IjUxMnB4Ij48Zz48Zz48cGF0aCBkPSJtMTA4LjE2OSAwYy0xOS4wMDIgMC0zNC40MDYgMTUuNDA0LTM0LjQwNiAzNC40MDZ2NDQzLjE4OGMwIDE5LjAwMiAxNS40MDQgMzQuNDA2IDM0LjQwNiAzNC40MDZoMjk1LjY2MmMxOS4wMDIgMCAzNC40MDYtMTUuNDA0IDM0LjQwNi0zNC40MDZ2LTM3MS41YzAtNi45MTMtMi43NDYtMTMuNTQyLTcuNjM0LTE4LjQzMWwtODAuMDMtODAuMDNjLTQuODg4LTQuODg3LTExLjUxOC03LjYzMy0xOC40MzEtNy42MzN6IiBmaWxsPSIjZjVmNWY1Ii8+PC9nPjxwYXRoIGQ9Im00MzAuNjAzIDg3LjY2NC01My4wNDgtNTMuMDQ4LS4xODkgODguOTg1Yy0uMDEyIDUuNTg2IDQuNTEzIDEwLjEyMSAxMC4wOTkgMTAuMTIxIDUuNTc4IDAgMTAuMDk5IDQuNTIyIDEwLjA5OSAxMC4wOTl2MzMzLjc3NGMwIDE5LjAwMi0xNS40MDQgMzQuNDA2LTM0LjQwNiAzNC40MDZoNDAuNjcyYzE5LjAwMiAwIDM0LjQwNi0xNS40MDQgMzQuNDA2LTM0LjQwNnYtMzM2LjYxNC0zNC44ODdjLjAwMS02LjkxMy0yLjc0NS0xMy41NDItNy42MzMtMTguNDN6IiBmaWxsPSIjZWFlYWVhIi8+PHBhdGggZD0ibTQzMC42MDMgODcuNjY0LTgwLjAzLTgwLjAzYy0yLjIyOC0yLjIyOC00LjgyMS00LjAwNS03LjYzNC01LjI4NnY1OC41NDRjMCAxOS4wMDIgMTUuNDA0IDM0LjQwNiAzNC40MDYgMzQuNDA2aDU4LjU0NGMtMS4yODEtMi44MTQtMy4wNTgtNS40MDYtNS4yODYtNy42MzR6IiBmaWxsPSIjYThkMGQ1Ii8+PGc+PHBhdGggZD0ibTM4NS4zMjYgMzkwLjE3NWgtMjU4LjY1MmMtNi43NTkgMC0xMi4yMzgtNS40NzktMTIuMjM4LTEyLjIzOHYtMTg4LjE2OWMwLTYuNzU5IDUuNDc5LTEyLjIzOCAxMi4yMzgtMTIuMjM4aDI1OC42NTJjNi43NTkgMCAxMi4yMzggNS40NzkgMTIuMjM4IDEyLjIzOHYxODguMTY5YzAgNi43NTktNS40NzkgMTIuMjM4LTEyLjIzOCAxMi4yMzh6IiBmaWxsPSIjOWFlN2ZkIi8+PHBhdGggZD0ibTM4NS4zMjYgMTc3LjUyOWgtNDEuMDMxYzYuNzU5IDAgMTIuMjM4IDUuNDc5IDEyLjIzOCAxMi4yMzh2MTg4LjE2OWMwIDYuNzU5LTUuNDc5IDEyLjIzOC0xMi4yMzggMTIuMjM4aDQxLjAzMWM2Ljc1OSAwIDEyLjIzOC01LjQ3OSAxMi4yMzgtMTIuMjM4di0xODguMTY4YzAtNi43NTktNS40NzktMTIuMjM5LTEyLjIzOC0xMi4yMzl6IiBmaWxsPSIjNjRkY2ZjIi8+PHBhdGggZD0ibTMyNy40MzIgMjY5LjI4N2MtMy45MDMtNC42NjItMTEuMDcyLTQuNjYyLTE0Ljk3NCAwbC05NC4xNzIgMTEyLjUwMWMtMi4xMjggMi41NDItMi42NzggNS42MTQtMi4wNDcgOC4zODdoMTY5LjA4N2M2Ljc1OSAwIDEyLjIzOC01LjQ3OSAxMi4yMzgtMTIuMjM4di0yNC44Njh6IiBmaWxsPSIjODljNjI3Ii8+PHBhdGggZD0ibTM4NS4zMjYgMzkwLjE3NWM2Ljc1OSAwIDEyLjIzOC01LjQ3OSAxMi4yMzgtMTIuMjM4di0yNC44NjhsLTQxLjAzMS00OS4wMTh2ODYuMTI0eiIgZmlsbD0iIzdkYjcyMyIvPjxwYXRoIGQ9Im0yMDQuOTQ2IDIzOS41NTVjLTMuOTAzLTQuNjYyLTExLjA3Mi00LjY2Mi0xNC45NzQgMGwtNzUuNTM2IDkwLjIzN3Y0OC4xNDVjMCA2Ljc1OSA1LjQ3OSAxMi4yMzggMTIuMjM4IDEyLjIzOGgxOTkuNjM5Yy41NDQtMi43MDctLjAzMy01LjY3MS0yLjA5OC04LjEzOHoiIGZpbGw9IiM5NWQ1MjgiLz48L2c+PC9nPjwvc3ZnPgo='
//     $.get(url + '/acc-api/pin-getdata/' + gid).done(res => {
//         let data = res.data[0]
//         let img = data.img !== '-' ? data.img : icon;
//         let d_notify_format = formatDate(data.date_notify)
//         let d_fix_format
//         data.date_fix == null ? d_fix_format = data.date_fix : d_fix_format = formatDate(data.date_fix)

//         $('#gid').val(data.gid)
//         $('#risk_image').attr('src', img)
//         $('#date_notify').val(d_notify_format)
//         $('#validation').val(data.validation)
//         $('#status_fix').val(data.status_fix)
//         $('#date_fix').val(d_fix_format)
//     })
// }

function formatDate(d) {
    var now = new Date(d);
    var day = ("0" + now.getDate()).slice(-2);
    var month = ("0" + (now.getMonth() + 1)).slice(-2);
    return now.getFullYear() + "-" + (month) + "-" + (day);
}

var latlon;
function getDisease(lat, lon) {
    var point = L.layerGroup();
    var buff = 1000;
    const icon = './../img/caution.svg';
    const iconMarker = L.icon({
        iconUrl: icon,
        iconSize: [30, 30],
        iconAnchor: [15, 20],
        popupAnchor: [5, -36]
    });
    map.eachLayer((lyr) => {
        if (lyr.options.iconName == 'risk') {
            map.removeLayer(lyr);
        }
    });
    // $.get(url + '/acc-api/riskpoint/' + lat + '/' + lon + '/' + buff, (res) => {
    //     $('#sumpoint').text('พบจุดเสี่ยงใกล้คุณ ' + res.count + ' จุด');
    //     $('#items').empty();
    //     // console.log(res)
    //     let marker = L.geoJSON(res.data, {
    //         pointToLayer: function (feature, latlng) {
    //             return L.marker(latlng, {
    //                 icon: iconMarker,
    //                 iconName: 'risk',
    //                 attribute: feature.properties
    //             });
    //         },
    //         onEachFeature: (feature, layer) => {
    //             if (feature.properties) {
    //                 layer.bindPopup(feature.properties.name);
    //             }
    //             var newDiv = $(`<h4><span class="badge badge-warning">${feature.properties.stype} ${feature.properties.sname}</span></h4>`);
    //             // console.log(feature.properties)
    //             $('#items').append(newDiv);
    //         }
    //     });
    //     marker.addTo(point);
    //     point.addTo(map);
    // })

    // layerControl.addOverlay(point.addTo(map), 'จุดเสี่ยงในรัศมี 2 กม.');
}










