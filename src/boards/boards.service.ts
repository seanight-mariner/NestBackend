import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { BoardStatus } from './board-status.enum';
import { CreateBoardDto } from './dto/create-board.dto';
import { Board } from './board.entity';
import { User } from 'src/auth/user.entity';

@Injectable()
export class BoardsService {
  private readonly logger = new Logger(BoardsService.name);

  constructor(
    @InjectRepository(Board)
    private boardRepository: Repository<Board>,
  ) {}

  async getAllBoards(user: User): Promise<Board[]> {
    this.logger.debug('', 'getAllBoards');
    // const boards = await this.boardRepository.find();
    const query = this.boardRepository.createQueryBuilder('board');
    query.where('board.userId = :userId', { userId: user.id });
    const boards = await query.getMany();
    return boards;
  }

  async createBoard(
    createBoardDto: CreateBoardDto,
    user: User,
  ): Promise<Board> {
    this.logger.debug('', 'createBoard');
    const { title, description } = createBoardDto;

    const board = this.boardRepository.create({
      title,
      description,
      status: BoardStatus.PUBLIC,
      user,
    });

    await this.boardRepository.save(board);
    return board;
  }

  async getBoardById(id: number): Promise<Board> {
    this.logger.debug('', 'getBoardById');
    const found = await this.boardRepository.findOneBy({ id });

    if (!found) {
      this.logger.warn(`Can't find Board with id ${id}`, 'getBoardById');
      throw new NotFoundException(`Can't find Board with id ${id}`);
    }
    return found;
  }

  async deleteBoard(id: number, user: User): Promise<void> {
    this.logger.debug('', 'deleteBoard');
    const result = await this.boardRepository.delete({id, user});

    if (result.affected === 0) {
      this.logger.warn(`Can't find Board with id ${id}`, 'deleteBoard');
      throw new NotFoundException(`Can't find Board with id ${id}`);
    }
  }

  async updateBoardStaus(id: number, status: BoardStatus): Promise<Board> {
    this.logger.debug('', 'updateBoardStaus');
    const board = await this.getBoardById(id);
    board.status = status;
    await this.boardRepository.save(board);
    return board;
  }
}
