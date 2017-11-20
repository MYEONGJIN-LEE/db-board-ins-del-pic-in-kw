var express = require('express');
var router = express.Router();

/* MySQL Variable */
var mysql_dbc = require('./db/db_con')();
var connection = mysql_dbc.init();

var request = require("request");
var cheerio = require("cheerio");

/* 회원 가입 */
router.post('/createAccount', function(req, res, next) {
  var value = {
    ID            : req.body.id,
    Password      : req.body.password,
    Name          : req.body.name,
  };

  var query = 'insert into `USERS` SET ?, Regist_date = now()';
  connection.query(query, value, function (err, result) {
    if(err) {
      console.log('err :' + err);
      res.send('<script>alert("아이디가 존재합니다.");location.href="/createAccount";</script>');
    } else {
      res.send('<script>alert("회원가입이 완료되었습니다.");location.href="/";</script>');
    }
  });
});

/* 게시글 등록 */
router.post('/writePost', function (req, res, next) {
  request(req.body.URL, function (err, req_res, html) {
    if(err) throw err;

    var $ = cheerio.load(html);
    var title = $('meta[property="og:title"]').attr('content');
    var content = $('meta[property="og:description"]').attr('content');
    var image = $('meta[property="og:image"]').attr('content');
    if(title == null) {
      title = $('title').text();
    }
    if(title == null) {
      title = $('h1').text();
    }
    if(title == null) {
      title = $('h2').text();
    }
    if(content == null) {
      content = $('p').text().substr(0,100);
    }
    if(image == null) {
      image = $('img').attr('src');
    }

    var value = {
      ID            : req.session.passport.user.user_id,
      Title         : req.body.Title,
      Content       : req.body.Content,
      URL           : req.body.URL,
      MetaTitle     : title,
      MetaContent   : content,
      MetaImage     : image
    }

    var HashTags = req.body.HashTags;
    HashTags = HashTags.split(',');

    var first_query = 'insert into BOARDS SET NO = NULL, Hit = 0, Create_date = now(), ?';
    connection.query(first_query, value, function (err, result) {
      if(err) {
        console.log('err :' + err);
        res.send('<script>alert("등록 중 에러가 발생하였습니다.");location.href="/account/writePost";</script>');
      } else {
        var NO = result.insertId;
        var second_query = 'insert into HASHTAGS(NO,HashTag) VALUES';
        for(var i=0; i<HashTags.length; i++) {
          second_query += '(' + NO + ',' + '"' + HashTags[i] + '"' + ')';
          if(i!=HashTags.length-1) second_query +=',';
        } second_query += ';';

        connection.query(second_query,function (err, result) {
          if(err) {
            console.log('err :' + err);
            res.send('<script>alert("등록 중 에러가 발생하였습니다.");location.href="/account/writePost";</script>');
          } else {
            console.log('게시글 등록이 완료되었습니다.');
            res.send('<script>alert("게시글 등록이 완료되었습니다.");location.href="/account/";</script>');
          }
        })
      }
    })
  })
})

/* Ajax : 좋아요 */
router.post('/like', function (req, res, next) {
  var state = req.body.state;
  var user_id = req.body.user_id;
  var board_no = req.body.board_no;
  console.log(state);
  console.log(user_id);
  console.log(board_no);
  /*
    DB operation..
    using state..
    return result..
  */
  var result = 'success';
  res.send({result:result});
})

module.exports = router;
