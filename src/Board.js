import React from 'react';
import './Board.css';
import classnames from 'classnames';

// timing constants

// how often bases update - eventually should be once/minute?
const BASE_TICK_INTERVAL = 3000;

// how often mines update - eventually once every five minutes?
const MINE_TICK_INTERVAL = BASE_TICK_INTERVAL * 5;

class Board extends React.Component{
  constructor (props) {
    super(props);
    this.state = {
      selectedNode: null,
      playerPoints: 0,
      playerMPH: 6.0,
      board: [
        {
          drillers: 0,
          isPlayerControlled: true,
          id: 1,
        }, null, null, null, null, null, null, null,
        null, null, null, null, null, null, null, null,
        null, null, null, null, null, null, null, null,
        null, null, null, null, {
          drillers: 0,
          isMine: true,
          id: 2,
        }, null, null, null,
        null, null, null, null, null, null, null, null,
        null, null, null, null, null, null, {
          drillers: 0,
          id: 3,
        }, null,
        null, null, null, null, null, null, null, null,
        null, {
          drillers: 0,
          id: 4,
        }, null, null, null, null, null, null,
      ]
    }
  }

  selectNode = number => {
    console.log("number", number)
    this.setState({
      selectedNode: number,
    })
  }

  onTick = baseIndex => {
    let newBoard = this.state.board;
    let updatedBase = newBoard[baseIndex];
    updatedBase.drillers += 1;
    newBoard[baseIndex] = updatedBase;
    this.setState({
      board: newBoard,
    })
  }

  renderRow = rowNumber => {
    let row=[];
    for (let i=0; i<=7; i++) {
      const index = (rowNumber * 8) + i;
      if (this.state.board[index]) {
        const base = this.state.board[index];
        console.log("BASE!", base)
        row.push(
          <Node
            key={index}
            onClick={() => this.selectNode(index)}
            selected={index === this.state.selectedNode}
            boosted={index === this.state.selectedNode}
            onTick={() => this.onTick(index)}
            playerMPH={this.state.playerMPH}
            rowNumber={index}
            playerControlled={base.isPlayerControlled}
            mine={base.isMine}
            drillers={base.drillers}
          />
        )
      } else {
        row.push(
          <div className="water" />
        )
      }
    }
    return <div key={rowNumber} className="chess_row">{row}</div>
  }

  render() {
   let rows = []
   for(var i=0;i<=7;i++){
     rows.push(
        this.renderRow(i)
      )
   }
   return (
    <div className="chess_board">
      {rows}
    </div>
   );
  }
}

class Node extends React.Component {
  // constructor(props) {
  //   super(props);
  //   this.state = {
  //     drillers: 0,
  //   }
  // }

  componentDidMount = () => {
    if (this.props.playerControlled || this.props.opponentControlled) {
      // produce drillers if the node is controlled
      if (this.props.boosted) {
        // increase production if the node is being boosted
        this.timerId = setInterval(this.props.onTick, BASE_TICK_INTERVAL / 2);
      } else {
        this.timerId = setInterval(this.props.onTick, BASE_TICK_INTERVAL);
      }
    }
  }

  componentWillReceiveProps = nextProps => {
    if (this.props.playerControlled || this.props.opponentControlled) {
      if (!this.props.boosted && nextProps.boosted) {
        clearInterval(this.timerId);
        this.timerId = setInterval(this.props.onTick, BASE_TICK_INTERVAL / 2);
      }
      if (this.props.boosted && !nextProps.boosted) {
        clearInterval(this.timerId);
        this.timerId = setInterval(this.props.onTick, BASE_TICK_INTERVAL);
      }
    }
  }

  render() {
    return (
      <div
        className={classnames({
          node: true,
          selected: this.props.selected,
          playerControlled: this.props.playerControlled,
          opponentControlled: this.props.opponentControlled,
          mine: this.props.mine,
        })}
        onClick={this.props.onClick}>
        {this.props.drillers}
      </div>
    )
  }
}

export default Board;