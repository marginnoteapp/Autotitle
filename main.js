JSB.newAddon = function(mainPath){
  var newAddonClass = JSB.defineClass('AutoTitle : JSExtension', /*Instance members*/{
    //Window initialize
    sceneWillConnect: function() {
        self.webController = WebViewController.new();
    },
    //Window disconnect
    sceneDidDisconnect: function() {
    },
    //Window resign active
    sceneWillResignActive: function() {
    },
    //Window become active
    sceneDidBecomeActive: function() {
    },
    notebookWillOpen: function(notebookid) {
      NSNotificationCenter.defaultCenter().addObserverSelectorName(self,'onProcessExcerptText:','ProcessNewExcerpt');
      NSNotificationCenter.defaultCenter().addObserverSelectorName(self,'onProcessExcerptText:','ChangeExcerptRange');
      self.autotitle = NSUserDefaults.standardUserDefaults().objectForKey('marginnote_autotitle');
    },
    notebookWillClose: function(notebookid) {
      NSNotificationCenter.defaultCenter().removeObserverName(self,'ProcessNewExcerpt');
      NSNotificationCenter.defaultCenter().removeObserverName(self,'ChangeExcerptRange');
    },
    documentDidOpen: function(docmd5) {
    },
    documentWillClose: function(docmd5) {
    },
    controllerWillLayoutSubviews: function(controller) {
    },
    queryAddonCommandStatus: function() {
      if(Application.sharedInstance().studyController(self.window).studyMode < 3)
        return {image:'title.png',object:self,selector:'toggleAutoTitle:',checked:(self.autotitle?true:false)};
      return null;
    },
    //Clicking note
    onProcessExcerptText: function(sender){
      if(!Application.sharedInstance().checkNotifySenderInWindow(sender,self.window))return;//Don't process message from other window
      if(!self.autotitle)return;
      var noteid = sender.userInfo.noteid;
      var note = Database.sharedInstance().getNoteById(noteid);
      if(note && note.excerptText && note.excerptText.length > 0 && note.excerptText.length <= 250){
        var timerCount = 0;
        NSTimer.scheduledTimerWithTimeInterval(1,true,function(timer){
          var text = note.excerptText.split("**").join("");
          if(text && text.length){
            UndoManager.sharedInstance().undoGrouping('AutoTitle',note.notebookId,function(){
              note.noteTitle = text;
              note.excerptText = '';
              Database.sharedInstance().setNotebookSyncDirty(note.notebookId);
            });
            NSNotificationCenter.defaultCenter().postNotificationNameObjectUserInfo('RefreshAfterDBChange',self,{topicid:note.notebookId});
          }
          timerCount++;
          if(timerCount >= 4){
            timer.invalidate();
          }
        });
      }
    },
    toggleAutoTitle: function(sender) {
      var lan = NSLocale.preferredLanguages().length?NSLocale.preferredLanguages()[0].substring(0,2):'en';
      if(self.autotitle){
        self.autotitle = false;
        if(lan == 'zh')
          Application.sharedInstance().showHUD('自动设置标题已关闭',self.window,2);
        else
          Application.sharedInstance().showHUD('Auto title is turned off',self.window,2);
      }
      else{
        self.autotitle = true;
        if(lan == 'zh')
          Application.sharedInstance().showHUD('创建摘录后，摘录内容将自动被设置为笔记标题',self.window,2);
        else
          Application.sharedInstance().showHUD('After creating an excerpt, the excerpt will be automatically set as the note title',self.window,2);
      }
      NSUserDefaults.standardUserDefaults().setObjectForKey(self.autotitle,'marginnote_autotitle');
      Application.sharedInstance().studyController(self.window).refreshAddonCommands();
    },
  }, /*Class members*/{
    addonDidConnect: function() {
    },
    addonWillDisconnect: function() {
    },
    applicationWillEnterForeground: function() {
    },
    applicationDidEnterBackground: function() {
    },
    applicationDidReceiveLocalNotification: function(notify) {
    },
  });
  return newAddonClass;
};

