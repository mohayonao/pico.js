package {
  import flash.display.Sprite;
  import flash.events.SampleDataEvent;
  import flash.media.Sound;
  import flash.utils.ByteArray;
  import flash.external.ExternalInterface;

  public class pico extends Sprite {
    private var _sound:Sound = null;
    private var _playing:Boolean = false;
    private var _stream:Vector.<Number> = new Vector.<Number>(65536, true);
    private var _wIndex:int = 0;
    private var _rIndex:int = 0;

    function pico() {
      ExternalInterface.addCallback("play", _play);
      ExternalInterface.addCallback("pause", _pause);
      ExternalInterface.addCallback("write", _write);
      ExternalInterface.call("picojs$flashfallback");
    }

    private function _play():void {
      _playing = true;
      _wIndex = 4096;
      _rIndex = 0;
      if (_sound == null) {
        _sound = new Sound();
        _sound.addEventListener(SampleDataEvent.SAMPLE_DATA, _onaudioprocess);
        _sound.play();
      }
    }

    private function _pause():void {
      _playing = false;
      for (var i:int = 0, imax:int = _stream.length; i < imax; i++) {
        _stream[i] = 0;
      }
    }

    private function _write(samples:String):void {
      for (var i:int = 0, imax:int = samples.length; i < imax; i++) {
        _stream[_wIndex++] = (samples.charCodeAt(i) - 32768) / 16384;
      }
      _wIndex &= 0xffff;
    }

    private function _onaudioprocess(e:SampleDataEvent):void {
      var out:ByteArray = e.data;
      for (var i:int = 0; i < 8192; i++) {
        out.writeFloat(_stream[_rIndex++]);
      }
      _rIndex &= 0xffff;
    }
  }
}
