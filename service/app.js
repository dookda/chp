const express = require('express');
const app = express.Router();
const con = require("./db");
const th = con.th;
const cp = con.cp;


app.get('/cp-api/get', (req, res, next) => {
    const sql = `SELECT *, to_char(datecollect, 'DD TMMonth YYYY') as datecollect FROM childprofile ORDER BY gid desc`;
    ac.query(sql).then((data) => {
        res.send(JSON.stringify({
            data: data.rows
        }));
    }).catch((err) => {
        return next(err);
    })
});

app.post('/cp-api/insert', (req, res) => {
    const { dateCollect, schoolName, stdName, sex, stdAge, className, dateSick, dateAbsent, disease, img, travel, sickLocation, phone, geom } = req.body;
    const sql = 'INSERT INTO childprofile (datecollect,schoolname,stdname,sex,stdage,classname,datesick,dateabsent,disease,img,travel,sickLocation,phone,geom)' +
        'VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,ST_SetSRID(st_geomfromgeojson($14), 4326))';
    const val = [dateCollect, schoolName, stdName, sex, Number(stdAge), className, dateSick, dateAbsent, disease, img, travel, sickLocation, phone, geom];
    // console.log(req)
    cp.query(sql, val).then(() => {
        res.status(200).json({
            status: "success",
            message: "insert data"
        });
    });
})

app.get("/cp-api/getdata", (req, res) => {
    const sql = "SELECT datecollect,schoolname,stdname,sex,stdage,classname,datesick,dateabsent,disease,img,travel,sickLocation,phone, st_x(geom) as lon, st_y(geom) as lat FROM childprofile";
    let jsonFeatures = [];
    cp.query(sql).then(data => {
        var rows = data.rows;
        rows.forEach(e => {
            // console.log(e.img)
            let feature = {
                type: "Feature",
                properties: e,
                geometry: {
                    type: "Point",
                    coordinates: [e.lon, e.lat]
                }
            };
            jsonFeatures.push(feature);
        });
        let geoJson = {
            type: "FeatureCollection",
            features: jsonFeatures
        };
        res.status(200).json(geoJson);
    });
});


module.exports = app;