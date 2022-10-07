import { ArgumentMetadata, BadRequestException, Logger, PipeTransform } from '@nestjs/common';
import { BoardStatus } from '../board-status.enum';

export class BoardStatusValidationPipe implements PipeTransform {
	private readonly logger = new Logger(BoardStatusValidationPipe.name);

	readonly StatusOptions = [
		BoardStatus.PUBLIC,
		BoardStatus.PRIVATE,
	]

  transform(value: any) {
    value = value.toUpperCase();

		if (!this.isStatusValid(value)) {
			this.logger.warn(`${value} isn't in the status options`, 'transform');
			throw new BadRequestException(`${value} isn't in the status options`)
		}

    return value;
  }

	private isStatusValid(status: any) {
		const index = this.StatusOptions.indexOf(status)
		return index !== -1;
	}
}
