import cn from 'classnames';
import * as React from 'react';

const Table = React.forwardRef<
  HTMLTableElement,
  React.HTMLAttributes<HTMLTableElement>
>(({ className, children, ...props }, ref) => (
  <div className="hidden-scrollbar w-full overflow-auto">
    <table
      ref={ref}
      className={cn(
        'w-full max-w-full table-fixed border-collapse text-sm',
        className,
      )}
      {...props}
    >
      {children}
    </table>
  </div>
));
Table.displayName = 'Table';

const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead
    ref={ref}
    className={cn(
      'border-neutral-800 [&_td]:border-b [&_th]:font-bold',
      className,
    )}
    {...props}
  />
));
TableHeader.displayName = 'TableHeader';

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn(
      '[&_tr:last-child]:border-0 [&_tr:hover]:bg-neutral-1000',
      className,
    )}
    {...props}
  />
));
TableBody.displayName = 'TableBody';

const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn('bg-primary text-primary-foreground font-medium', className)}
    {...props}
  />
));
TableFooter.displayName = 'TableFooter';

const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement> & { light?: boolean }
>(({ className, light, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      'group border-b transition-colors data-[state=selected]:bg-neutral-1000',
      {
        'border-neutral-900': !light,
        'border-neutral-200': light,
      },
      className,
    )}
    {...props}
  />
));
TableRow.displayName = 'TableRow';

const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement> & { light?: boolean }
>(({ className, light, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      'py-2 px-4 text-left align-middle font-medium [&:has([role=checkbox])]:pr-0',
      {
        'text-muted-foreground': !light,
        'text-neutral-500': light,
      },
      className,
    )}
    {...props}
  />
));
TableHead.displayName = 'TableHead';

const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement> & { noIndent?: boolean }
>(({ className, noIndent, ...props }, ref) => (
  <td
    ref={ref}
    className={cn(
      'py-2 pr-4 align-middle [&:has([role=checkbox])]:pr-0 [&:has(.prompt)]:w-full',
      className,
      {
        'pl-4': !noIndent,
      },
    )}
    {...props}
  />
));
TableCell.displayName = 'TableCell';

const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
  <caption
    ref={ref}
    className={cn('text-muted-foreground mt-4 text-sm', className)}
    {...props}
  />
));
TableCaption.displayName = 'TableCaption';

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
};
