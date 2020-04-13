if (jQuery) {
  var checkAnswers = function(){ 
    var answerString = ""; 
    var answers = $(":checked"); 
    answers.each(function(i) { 
      answerString = answerString + answers[i].value; 
    }); 
    $(":checked").each(function(i) { 
      var answerString = answerString + answers[i].value; 
    }); 
    checkIfCorrect(answerString); 
  }; 
  
  var checkIfCorrect = function(theString){ 
    if(parseInt(theString, 16) === 616162){ 
      $("body").addClass("correct"); 
      $("h1").text("You Win!"); 
      $("canvas").show(); 
    } 
  };

  $("#question1").show();
  //$("#question2").show();
  //$("#question3").show();
};

if(jQuery){
  $("#question2").show();
};

if(jQuery){
  $("#question3").show();
};

