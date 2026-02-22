const emailDataModel = require("../models/emailDataModel");
const flash = require('connect-flash');

// ------------------------ GET show all data page -------------------------
showallGetCtr = async (req, res) => {
    try {
        const data = await emailDataModel.find({}).sort({ "type": 1, "clg_code": 1 });
        res.status(200).render("showall", { data, title: "All Records", message: req.flash("message") });
    } catch (error) {
        console.log("error: ", error.message);
    }
};

// -------------------------- GET add new email page -------------------------
addClgGetCtr = (req, res) => {

    res.status(200).render("addClg", { message: req.flash("message"), title: "Add" });
};

// --------------------------------POST add new record---------------------------
addClgPostCtr = async (req, res) => {
    const { clg_code, clg_name, center_code, center_name, pr_name, pr_mobile, dealing_name, dealing_mobile, email1, email2, email3, address, district, type, remarks } = req.body;
    try {
        if (!(clg_code && type)) {
            req.flash("message", "Provide required data !")
            res.status(400).redirect("/api/show/addclg");
        }

        let data = await emailDataModel.findOne({ clg_code });
        if (!data) {
            const newData = new emailDataModel({
                clg_code, clg_name, center_code, center_name, pr_name, pr_mobile, dealing_name, dealing_mobile, email1, email2, email3, address, district, type, remarks
            });
            let saveData = await newData.save();
            if (saveData) {
                req.flash("message", "Record Saved Successfully !")
                res.status(201).redirect("/api/show/addclg");
            }
        } else {
            req.flash("message", "Data Already Exist !")
            res.status(400).redirect("/api/show/addclg");
        }

    } catch (error) {
        console.log('addClgPostCtr err: ', error.message);
    }
};

// ----------------------------- GET edit deptt college -----------------------------------
editClgGetCtr = async (req, res) => {
    try {

        if (req.query.clg_code) {
            const { clg_code } = req.query;

            let data = await emailDataModel.findOne({ clg_code });

            if (data) {
                res.status(200).render("editClg", { data, message: req.flash("message"), title: "Edit Deptt/College" });
            } else {
                res.status(400).render("editClg", { data, message: "Record not found !", title: "Edit Deptt/College" });
            }
        } else {
            res.status(200).render("editClg", { data: "", message: req.flash("message"), title: "Edit Deptt/College" });
        }

    } catch (error) {
        console.log('edit get error: ', error.message);
    }
};

// -------------------------------- POST edit deptt college ---------------------------------
editClgPostCtr = async (req, res) => {
    try {
        const { clg_code, clg_name, center_code, center_name, pr_name, pr_mobile, dealing_name, dealing_mobile, email1, email2, email3, address, district, type, remarks } = req.body;

        let newData = await emailDataModel.updateOne({ clg_code }, { clg_name, center_code, center_name, pr_name, pr_mobile, dealing_name, dealing_mobile, email1, email2, email3, address, district, type, remarks });

        if (newData) {
            req.flash("message", "Record Updated Successfully !")
            res.status(200).redirect("/api/show/editclg");
        }
    } catch (error) {
        console.log('edit ClgPostCtr err: ', error.message);
    }
};

// ------------------------------- GET Del rec deptt college--------------------------------------
delClgGetCtr = async (req, res) => {
    try {

        if (req.query.clg_code) {
            const { clg_code } = req.query;

            let data = await emailDataModel.findOne({ clg_code });

            if (data) {
                res.status(200).render("deleteClg", { data, message: req.flash("message"), title: "Delete Record Deptt/College" });
            } else {
                res.status(400).render("deleteClg", { data, message: "Record not found !", title: "Delete Record Deptt/College" });
            }
        } else {
            res.status(200).render("deleteClg", { data: "", message: req.flash("message"), title: "Delete Record Deptt/College" });
        }

    } catch (error) {
        console.log('del get error: ', error.message);
    }
};

// ---------------------------- DELETE rec deptt college----------------------------------------
delClgDelCtr = async (req, res) => {
    const { clg_code } = req.body;
    try {

        let delData = await emailDataModel.deleteOne({ clg_code });
        // console.log(delData);
        if (delData) {
            req.flash("message", "Record Deleted Successfully !")
            res.status(200).redirect("/api/show/delclg");
        }
    } catch (error) {
        console.log('del Ctr err: ', error.message);
    }
};

// -------------------- GET for copy paste deptt/clgs/neighbourhood clgs wise ----------------------
emailForCopyGetCtr = async (req, res) => {
    try {
        // deptt
        const deptt = await emailDataModel.find(
            { $or: [{ type: "deptts" }, { type: "Deptts" }] },
            { email1: 1, email2: 1, email3: 1, _id: 0 }
        ).sort({ clg_code: 1 });

        let emailDeptt1 = "";
        let emailDeptt2 = "";
        let emailDeptt3 = "";

        deptt.forEach(function (item, i) {
            i = i + 1;
            if (i <= 25) {
                emailDeptt1 = emailDeptt1 + item.email1 + ", " + item.email2 + ", " + item.email3 + ", ";
            }
            if (i >= 26 && i <= 50) {
                emailDeptt2 = emailDeptt2 + item.email1 + ", " + item.email2 + ", " + item.email3 + ", ";
            }
            if (i >= 51 && i <= 75) {
                emailDeptt3 = emailDeptt3 + item.email1 + ", " + item.email2 + ", " + item.email3 + ", ";
            }
        });
        let depttStr1 = emailDeptt1.replace(/ ,/g, "");
        let depttStr2 = emailDeptt2.replace(/ ,/g, "");
        let depttStr3 = emailDeptt3.replace(/ ,/g, "");

        let depttCount1 = depttStr1.match(/@/g);
        depttCount1 = depttCount1 === null ? 0 : depttCount1.length;

        let depttCount2 = depttStr2.match(/@/g);
        depttCount2 = depttCount2 === null ? 0 : depttCount2.length;

        let depttCount3 = depttStr3.match(/@/g);
        depttCount3 = depttCount3 === null ? 0 : depttCount3.length;



        let depttTotEmails = depttCount1 + depttCount2 + depttCount3;

        // neighbourhood regional
        const data2 = await emailDataModel.find(
            { type: "NCRC" },
            { email1: 1, email2: 1, email3: 1, _id: 0 }
        ).sort({ clg_code: 1 });

        let emailNCRC = "";
        data2.forEach(function (item, i) {
            emailNCRC = emailNCRC + item.email1 + ", " + item.email2 + ", " + item.email3 + ", ";
        });
        let strNCRC = emailNCRC.replace(/ ,/g, "");
        let countNCRC = strNCRC.match(/@/g);
        countNCRC = countNCRC === null ? 0 : countNCRC.length;

        // constituent
        const data3 = await emailDataModel.find(
            { type: "Constituent" },
            { email1: 1, email2: 1, email3: 1, _id: 0 }
        ).sort({ clg_code: 1 });
        let constituent = "";
        data3.forEach(function (item, i) {
            constituent = constituent + item.email1 + ", " + item.email2 + ", " + item.email3 + ", ";
        });
        let strConstituent = constituent.replace(/ ,/g, "");
        let countConstituent = strConstituent.match(/@/g);
        countConstituent = countConstituent === null ? 0 : countConstituent.length;

        // Pvt clg
        const data4 = await emailDataModel.find(
            { $or: [{ type: "Pvt" }, { type: "pvt" }] },
            { email1: 1, email2: 1, email3: 1, _id: 0 }
        ).sort({ clg_code: 1 });

        let emailPvtClg1 = "";
        let emailPvtClg2 = "";
        let emailPvtClg3 = "";
        let emailPvtClg4 = "";
        let emailPvtClg5 = "";
        let emailPvtClg6 = "";
        let emailPvtClg7 = "";
        let emailPvtClg8 = "";
        let emailPvtClg9 = "";

        let arr = [];
        let str = "";
        data4.forEach(function (item, i) {
            str = str + item.email1 + ", " + item.email2 + ", " + item.email3 + ", ";
        });

        str = str.replace(/ ,/g, "");
        str = str.trimEnd();
        arr = str.split(", ");

        arr.forEach(function (item2, i) {
            i = i + 1;
            if (i <= 50) {
                emailPvtClg1 = emailPvtClg1 + item2 + ", ";
            }
            if (i > 50 && i <= 100) {
                emailPvtClg2 = emailPvtClg2 + item2 + ", ";
            }
            if (i > 100 && i <= 150) {
                emailPvtClg3 = emailPvtClg3 + item2 + ", ";
            }
            if (i > 150 && i <= 200) {
                emailPvtClg4 = emailPvtClg4 + item2 + ", ";
            }
            if (i > 200 && i <= 250) {
                emailPvtClg5 = emailPvtClg5 + item2 + ", ";
            }
            if (i > 250 && i <= 300) {
                emailPvtClg6 = emailPvtClg6 + item2 + ", ";
            }
            if (i > 300 && i <= 350) {
                emailPvtClg7 = emailPvtClg7 + item2 + ", ";
            }
            if (i > 350 && i <= 400) {
                emailPvtClg8 = emailPvtClg8 + item2 + ", ";
            }
            if (i > 400 && i <= 450) {
                emailPvtClg9 = emailPvtClg9 + item2 + ", ";
            }
        });

        emailPvtClg1 = emailPvtClg1.trimEnd();
        emailPvtClg2 = emailPvtClg2.trimEnd();
        emailPvtClg3 = emailPvtClg3.trimEnd();
        emailPvtClg4 = emailPvtClg4.trimEnd();
        emailPvtClg5 = emailPvtClg5.trimEnd();
        emailPvtClg6 = emailPvtClg6.trimEnd();
        emailPvtClg7 = emailPvtClg7.trimEnd();
        emailPvtClg8 = emailPvtClg8.trimEnd();
        emailPvtClg9 = emailPvtClg9.trimEnd();

        var pvtClgCount1 = emailPvtClg1.match(/@/g);
        pvtClgCount1 = pvtClgCount1 === null ? 0 : pvtClgCount1.length;

        var pvtClgCount2 = emailPvtClg2.match(/@/g);
        pvtClgCount2 = pvtClgCount2 === null ? 0 : pvtClgCount2.length;

        var pvtClgCount3 = emailPvtClg3.match(/@/g);
        pvtClgCount3 = pvtClgCount3 === null ? 0 : pvtClgCount3.length;

        var pvtClgCount4 = emailPvtClg4.match(/@/g);
        pvtClgCount4 = pvtClgCount4 === null ? 0 : pvtClgCount4.length;

        var pvtClgCount5 = emailPvtClg5.match(/@/g);
        pvtClgCount5 = pvtClgCount5 === null ? 0 : pvtClgCount5.length;

        var pvtClgCount6 = emailPvtClg6.match(/@/g);
        pvtClgCount6 = pvtClgCount6 === null ? 0 : pvtClgCount6.length;

        var pvtClgCount7 = emailPvtClg7.match(/@/g);
        pvtClgCount7 = pvtClgCount7 === null ? 0 : pvtClgCount7.length;

        var pvtClgCount8 = emailPvtClg8.match(/@/g);
        pvtClgCount8 = pvtClgCount8 === null ? 0 : pvtClgCount8.length;

        var pvtClgCount9 = emailPvtClg9.match(/@/g);
        pvtClgCount9 = pvtClgCount9 === null ? 0 : pvtClgCount9.length;


        // others
        const data5 = await emailDataModel.find(
            { type: "Others" },
            { email1: 1, email2: 1, email3: 1, _id: 0 }
        ).sort({ clg_code: 1 });

        var strOthers = "";
        var countOthers = 0;
        // console.log("len:", data5);

        if (data5) {
            data5.forEach(function (item3) {
                strOthers = strOthers + item3.email1 + ", " + item3.email2 + ", " + item3.email3 + ", ";
            });
            strOthers = strOthers.replace(/ ,/g, "");

            countOthers = strOthers.match(/@/g);
            countOthers = countOthers === null ? 0 : countOthers.length;
        }




        // ---------

        let pvtTotEmails = pvtClgCount1 + pvtClgCount2 + pvtClgCount3 + pvtClgCount4 + pvtClgCount5 + pvtClgCount6 + pvtClgCount7 + pvtClgCount8 + pvtClgCount9

        let totalEmails = depttTotEmails + countNCRC + countConstituent + pvtTotEmails + countOthers;

        // console.log(emailDeptt);
        res.status(200).render("emailscp", {
            depttStr1,
            depttStr2,
            depttStr3,
            depttCount1,
            depttCount2,
            depttCount3,

            strNCRC,
            countNCRC,

            strConstituent,
            countConstituent,

            emailPvtClg1,
            emailPvtClg2,
            emailPvtClg3,
            emailPvtClg4,
            emailPvtClg5,
            emailPvtClg6,
            emailPvtClg7,
            emailPvtClg8,
            emailPvtClg9,

            pvtClgCount1,
            pvtClgCount2,
            pvtClgCount3,
            pvtClgCount4,
            pvtClgCount5,
            pvtClgCount6,
            pvtClgCount7,
            pvtClgCount8,
            pvtClgCount9,

            strOthers,
            countOthers,

            depttTotEmails,
            pvtTotEmails,
            totalEmails,

            title: "Emails ids for Copy/Paste",
        });
    } catch (error) { console.log('err: ', error.message); }
};
// -------------------- GET for 50 50 email slot for copy paste ----------------------
email50GetCtr = async (req, res) => {
    let arr = [];
    let a = await emailDataModel.find({ "type": { $ne: "Others" } }, { email1: 1, email2: 1, email3: 1 }).sort({ "type": 1, "clg_code": 1 });

    a.forEach(function (item1) {
        if (item1.email1 != "") {
            arr.push(item1.email1)
        }
        if (item1.email2 != "") {
            arr.push(item1.email2)
        }
        if (item1.email3 != "") {
            arr.push(item1.email3)
        }
    });
    let totalEmails;
    let = emailSlot1 = "", emailSlot2 = "", emailSlot3 = "", emailSlot4 = "", emailSlot5 = "", emailSlot6 = "", emailSlot7 = "", emailSlot8 = "", emailSlot9 = "", emailSlot10 = "", emailSlot11 = "", emailSlot12 = "";

    arr.forEach(function (item2, i) {
        totalEmails = arr.length;
        i++;
        if (i <= 50) {
            emailSlot1 = emailSlot1 + item2 + ", "
        }
        if (i > 50 && i <= 100) {
            emailSlot2 = emailSlot2 + item2 + ", "
        }
        if (i > 100 && i <= 150) {
            emailSlot3 = emailSlot3 + item2 + ", "
        }
        if (i > 150 && i <= 200) {
            emailSlot4 = emailSlot4 + item2 + ", "
        }
        if (i > 200 && i <= 250) {
            emailSlot5 = emailSlot5 + item2 + ", "
        }
        if (i > 250 && i <= 300) {
            emailSlot6 = emailSlot6 + item2 + ", "
        }
        if (i > 300 && i <= 350) {
            emailSlot7 = emailSlot7 + item2 + ", "
        }
        if (i > 350 && i <= 400) {
            emailSlot8 = emailSlot8 + item2 + ", "
        }
        if (i > 400 && i <= 450) {
            emailSlot9 = emailSlot9 + item2 + ", "
        }
        if (i > 450 && i <= 500) {
            emailSlot10 = emailSlot10 + item2 + ", "
        }
        if (i > 500 && i <= 550) {
            emailSlot11 = emailSlot11 + item2 + ", "
        }
        if (i > 550 && i <= 600) {
            emailSlot12 = emailSlot12 + item2 + ", "
        }

    })

    res.status(200).render('email50', { title: "Email Slots 50", totalEmails, emailSlot1, emailSlot2, emailSlot3, emailSlot4, emailSlot5, emailSlot6, emailSlot7, emailSlot8, emailSlot9, emailSlot10, emailSlot11, emailSlot12 });
}



module.exports = { showallGetCtr, addClgGetCtr, addClgPostCtr, emailForCopyGetCtr, email50GetCtr, editClgGetCtr, editClgPostCtr, delClgGetCtr, delClgDelCtr };
