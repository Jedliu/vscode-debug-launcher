
/* IMPORT */

import * as _ from 'lodash';
import * as querystring from 'querystring';
import * as vscode from 'vscode';
import * as Commands from './commands';

/* URI HANDLER */

class DebugLauncherUriHandler implements vscode.UriHandler {

  private disposables: vscode.Disposable[] = [];

  constructor () {
    this.disposables.push ( vscode.window.registerUriHandler ( this ) );
  }

  dispose () {
    this.disposables.forEach ( disposable => disposable.dispose () );
    this.disposables = [];
  }

  handleUri ( uri: vscode.Uri ) {
    const command = _.trim ( uri.path, '/' );
    if ( !command ) return vscode.window.showErrorMessage ( 'You need to provide a command' );
    if ( !Commands[command] ) return vscode.window.showErrorMessage ( `No command named "${command}" found` );

    let args;
    if(command === 'launch'){
      // decode the base64 string and launch the command
      args = [_.attempt ( JSON.parse, Buffer.from(uri.query, 'base64').toString('ascii') )];
    }else{
      let plainArgs = _.trim ( _.castArray ( querystring.parse ( uri.query ).args )[0] || '', ',' );
      args = [_.attempt ( JSON.parse, plainArgs )];

      if ( !_.isPlainObject ( args[0] ) ) {
        args = _.filter ( plainArgs.split ( ',' ).map ( ( plainArg, index ) => {
          try {
            return JSON.parse ( plainArg );
          } catch ( e ) {
            return plainArg;
          }
        }));
      }
    }

    return Commands[command]( ...args );
  }
}

/* EXPORT */

export default DebugLauncherUriHandler;
